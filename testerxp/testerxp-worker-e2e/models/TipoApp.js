const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const tipoApp = sequelize.define(
  'tipo_app',
  {
    id_tipo_app: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
  );
module.exports = tipoApp;
