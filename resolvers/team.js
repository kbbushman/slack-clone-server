import formatErrors from '../utilities/formatErrors';
import authRequired from '../utilities/permissions';

export default {
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
};
