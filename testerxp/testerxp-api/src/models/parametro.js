const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const parametro = sequelize.define(
  'parametro',
  {
    id_parametro: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_prueba: {
      type: Sequelize.INTEGER
    },
    param: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = parametro;
