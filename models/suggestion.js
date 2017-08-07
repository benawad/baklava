export default (sequelize, DataTypes) => {
  const Suggestion = sequelize.define('suggestion', {
    text: DataTypes.STRING,
  });

  Suggestion.associate = (models) => {
    // many to many with suggestion
    Suggestion.belongsToMany(models.User, {
      through: models.Vote,
      foreignKey: 'suggestionId',
    });
  };

  return Suggestion;
};
