import formatErrors from '../utilities/formatErrors';
import authRequired from '../utilities/permissions';

export default {
  Query: {
    allTeams: authRequired.createResolver(async (parent, args, { models, user }) =>
      models.Team.findAll({ where: { owner: user.id }}, { raw: true })
  )},
  Mutation: {
    createTeam: authRequired.createResolver(async (parent, args, { models, user }) => {
      try {
        await models.Team.create({ ...args, owner: user.id });
        return {
          ok: true,
        };
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          errors: formatErrors(err),
        };
      };
    }),
  },
  Team: {
    channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id } }),
  }
};
