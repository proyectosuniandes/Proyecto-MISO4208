const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const estrategiaPrueba = sequelize.define(
  'estrategia_prueba',
  {
    id_estrategia: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    id_prueba: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    id_ejecucion: {
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = estrategiaPrueba;
