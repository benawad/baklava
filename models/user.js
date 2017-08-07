export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  User.associate = (models) => {
    // 1 to many with board
    User.hasMany(models.Board, {
      foreignKey: 'owner',
    });
    // 1 to many with suggestion
    User.hasMany(models.Suggestion, {
      foreignKey: 'creatorId',
    });
    // many to many with suggestion
    User.belongsToMany(models.Suggestion, {
      through: models.Vote,
      foreignKey: 'userId',
    });
  };

  return User;
};
