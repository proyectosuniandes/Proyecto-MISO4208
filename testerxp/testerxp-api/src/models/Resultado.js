const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const historicoPrueba = require('./HistoricoPrueba');

const version = sequelize.define(
  'resultado',
  {
    id_resultado: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historico: {
      type: Sequelize.INTEGER
    },
    ruta: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

version.hasMany(historicoPrueba, {
  foreignKey: 'id_his',
  sourceKey: 'historico'
});
historicoPrueba.belongsTo(version, {
  foreignKey: 'id_his',
  sourceKey: 'historico'
});

module.exports = version;
