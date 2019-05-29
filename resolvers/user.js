import bcrypt from 'bcrypt';
import _ from 'lodash';

const formatErrors = (err, models) => {
  if (err instanceof models.Sequelize.ValidationError) {
    return err.errors.map(error => _.pick(error, ['path', 'message']));
  }
  return [{ path: 'name', message: 'Something went wrong. Please try again' }];
}

export default {
  Query: {
    getUser: (parent, { id }, { models }) => models.User.findOne({where: { id }}),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { models }) => {
      try {
        if (password.length < 5 || password.length > 100) {
          return {
            ok: false,
            errors: [
              {
                path: 'password',
                message: 'The password must be between 5 and 100 characters',
              },
            ],
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await models.User.create({ ...otherArgs, password: hashedPassword });
        return {
          ok: true,
          user,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    },
  },
};
