import formatErrors from '../utilities/formatErrors';
import authRequired from '../utilities/permissions';

export default {
  Query: {
    allTeams: authRequired.createResolver(async (parent, args, { models, user }) =>
      models.Team.findAll({ where: { owner: user.id }}, { raw: true })
  )},
  Mutation: {
    addTeamMember: authRequired.createResolver(async (parent, { email, teamId }, { models, user }) => {
      try {
        const teamPromise = models.Team.findOne({ where: { id: teamId }}, { raw: true });
        const userToAddPromise = models.User.findOne({ where: { email }}, { raw: true });
        const [team, userToAdd] = await Promise.all([teamPromise, userToAddPromise]);
        if (team.owner !== user.id) {
          return {
            ok: false,
            errors: [{ path: 'email', message: 'You do not have permission to add members to this team' }],
          };
        }
        if (!userToAdd) {
          return {
            ok: false,
            errors: [{ path: 'email', message: `Could not find a user with email address ${email}` }],
          };
        }
        await models.Member.create({ userId: userToAdd.id, teamId });
        return {
          ok: true,
        };
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    }),
    createTeam: authRequired.createResolver(async (parent, args, { models, user }) => {
      try {
        // Use Sequelize transaction to prevent channel creation on team creation failure
        const response  = await models.sequelize.transaction(async () => {
          const team = await models.Team.create({ ...args, owner: user.id });
          await models.Channel.create({ name: 'general', public: true, teamId: team.id });
          return team;
        });
        return {
          ok: true,
          team: response,
        };
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    }),
  },
  Team: {
    channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id } }),
  }
};
