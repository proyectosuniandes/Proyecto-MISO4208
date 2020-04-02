const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const version = require('./version');

const app = sequelize.define(
  'app',
  {
    id_app: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.TEXT,
    },
    tipo_app: {
      type: Sequelize.ENUM('movil', 'web'),
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

app.hasMany(version, { foreignKey: 'id_app', sourceKey: 'id_app' });
version.belongsTo(app, { foreignKey: 'id_app', sourceKey: 'id_app' });

module.exports = app;
