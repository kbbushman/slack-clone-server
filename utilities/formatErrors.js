import _ from 'lodash';

export default (err, models) => {
  if (err instanceof models.Sequelize.ValidationError) {
    return err.errors.map(error => _.pick(error, ['path', 'message']));
  }
  return [{ path: 'name', message: 'Something went wrong. Please try again' }];
};
