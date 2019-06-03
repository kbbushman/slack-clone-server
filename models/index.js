import Sequelize from 'sequelize';
import keys from '../config/keys';

const sequelize = new Sequelize(keys.database, keys.username, keys.password, {
  dialect: 'postgres',
  define: {
    underscored: true,
  },
});

const models = {
  User: sequelize.import('./User'),
  Channel: sequelize.import('./Channel'),
  Message: sequelize.import('./Message'),
  Team: sequelize.import('./Team'),
  Member: sequelize.import('./Member'),
};

// Create Model Associations
Object.keys(models).forEach(modelName => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
