const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const ejecucion = require('./ejecucion');

const estrategiaPrueba = sequelize.define(
  'estrategia_prueba',
  {
    id_estrategia: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    id_prueba: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

estrategiaPrueba.hasMany(ejecucion, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
estrategiaPrueba.hasMany(ejecucion, {
  foreignKey: 'id_prueba',
  sourceKey: 'id_prueba',
});
ejecucion.belongsTo(estrategiaPrueba, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
ejecucion.belongsTo(estrategiaPrueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'id_prueba',
});

module.exports = estrategiaPrueba;
