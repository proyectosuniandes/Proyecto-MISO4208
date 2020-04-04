const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const navegadores = sequelize.define(
  'navegadores',
  {
    id_navegador: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_estrategia: {
      type: Sequelize.INTEGER,
    },
    navegador: {
      type: Sequelize.ENUM('chrome', 'firefox'),
    },
    version: {
      type: Sequelize.INTEGER,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = navegadores;
