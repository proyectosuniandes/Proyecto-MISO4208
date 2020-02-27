const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const tipoPrueba = require('./TipoPrueba');
const app = require('./App');
const prueba = sequelize.define(
  'prueba',
  {
    id_prueba: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: Sequelize.INTEGER
    },
    app: {
      TYPE: sequelize.INTEGER
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

prueba.hasMany(tipoPrueba, { foreignKey: 'tipo', sourceKey: 'id_tipo' });
prueba.hasMany(app, { foreignKey: 'app', sourceKey: 'id_app' });
app.belongsTo(prueba, { foreignKey: 'app', sourceKey: 'id_app' });
tipoPrueba.belongsTo(prueba, { foreignKey: 'tipo', sourceKey: 'id_tipo' });

module.exports = prueba;
