const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const tipoPrueba = sequelize.define(
  'tipo_prueba',
  {
    id_tipo: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: Sequelize.TEXT
    },
    parametros: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
  );

module.exports = tipoPrueba;
