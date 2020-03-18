const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const version = require('./version');
const prueba = sequelize.define(
  'prueba',
  {
    id_prueba: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_version: {
      type: Sequelize.INTEGER
    },
    id_app: {
      type: Sequelize.Integer
    },
    tipo_prueba: {
      type: Sequelize.ENUM('E2E', 'random', 'BDT', 'VRT')
    },
    modo_prueba: {
      type: Sequelize.ENUM('headless', 'headful')
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = prueba;
