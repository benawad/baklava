import Sequelize from 'sequelize';

const sequelize = new Sequelize('baklava', 'baklava_admin', 'celery', {
  host: 'localhost',
  dialect: 'postgres',
});

const db = {
  User: sequelize.import('./user'),
  Board: sequelize.import('./board'),
  Suggestion: sequelize.import('./suggestion'),
  FbAuth: sequelize.import('./FbAuth'),
  LocalAuth: sequelize.import('./localAuth'),
  Vote: sequelize.import('./vote'),
};

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

export default db;
