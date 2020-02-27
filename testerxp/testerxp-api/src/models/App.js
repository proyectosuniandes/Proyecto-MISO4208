const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const tipoApp = require('./TipoApp');
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
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

app.hasMany(tipoApp, { foreignKey: 'tipo_app', sourceKey: 'id_tipo_app' });
tipoApp.belongsTo(app, { foreignKey: 'tipo_app', sourceKey: 'id_tipo_app' });
module.exports = app;
