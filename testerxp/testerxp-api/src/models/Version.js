const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const app = require('./app');
const version = sequelize.define(
  'version',
  {
    id_version: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_app: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    descripcion: {
      type: Sequelize.TEXT
    },
    ruta_app: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);
module.exports = version;
