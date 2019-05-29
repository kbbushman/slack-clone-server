import bcrypt from 'bcrypt';
import _ from 'lodash';
import { tryLogin } from '../auth';

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
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) => tryLogin(email, password, models, SECRET, SECRET2),
    register: async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args);
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
