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
app.hasMany(tipoApp, { foreignKey: 'id_tipo_app', sourceKey: 'tipo_app' });
tipoApp.belongsTo(app, { foreignKey: 'id_tipo_app', sourceKey: 'tipo_app' });
module.exports = app;
