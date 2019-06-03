import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: 'The username can only contain letters and numbers',
        },
        len: {
          args: [3, 25],
          msg: 'The username must be between 3 and 25 characters long',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Please enter a valid email address'
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5, 100],
          msg: 'The password must be between 5 and 100 characters long',
        },
      }
    },
  },
  {
    hooks: {
      afterValidate: async (user) => {
        const hashedPassword =  await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
      },
    },
  });

  User.associate = models => {
    // Many-to-Many Join Table
    User.belongsToMany(models.Team, {
      through: models.Member,
      foreignKey: {
        name: 'userId',
        field: 'user_id',
      },
    });

    // Many-to_many
    User.belongsToMany(models.Channel, {
      through: 'channel_member',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
      },
    });
  };

  return User;
};
