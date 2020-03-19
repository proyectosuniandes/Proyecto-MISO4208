const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const tipoPrueba = require('./TipoPrueba');
const app = require('./App');
const script = require('./Script');

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
      type: Sequelize.INTEGER
    },
    script: {
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

prueba.hasMany(tipoPrueba, { foreignKey: 'id_tipo', sourceKey: 'tipo' });
prueba.hasMany(app, { foreignKey: 'id_app', sourceKey: 'app' });
prueba.hasMany(script, { foreignKey: 'id_script', sourceKey: 'script' });
app.belongsTo(prueba, { foreignKey: 'id_app', sourceKey: 'app' });
tipoPrueba.belongsTo(prueba, { foreignKey: 'id_tipo', sourceKey: 'tipo' });
script.belongsTo(prueba, { foreignKey: 'id_script', sourceKey: 'script' });
module.exports = prueba;
