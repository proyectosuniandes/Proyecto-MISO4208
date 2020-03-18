const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');

const app = sequelize.define(
  'app',
  {
    id_app: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: Sequelize.TEXT
    },
    tipo_app: {
      type: Sequelize.ENUM('movil', 'web')
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = app;
