const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('testerxp_db', 'postgres', 'Uniandes2020', {
  host: 'testerxp-db.c550ntlmux5u.us-east-2.rds.amazonaws.com',
  dialect: 'postgres',
  omitNull: true,
  pool: {
    max: 5,
    min: 0,
    require: 30000,
    idle: 10000
  }
});

module.exports = sequelize;