const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const resultado = sequelize.define(
  'resultado',
  {
    id_resultado: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_ejecucion: {
      type: Sequelize.INTEGER,
    },
    ruta_archivo: {
      type: Sequelize.TEXT,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = resultado;
