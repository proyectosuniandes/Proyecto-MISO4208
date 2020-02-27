const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const script = sequelize.define(
  'script',
  {
    id_script: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: Sequelize.TEXT
    },
    contenido: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = script;
