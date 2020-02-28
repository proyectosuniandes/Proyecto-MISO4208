const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const script = require('./Script');
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

tipoPrueba.hasMany(script, { foreignKey: 'id_script', sourceKey: 'script' });
script.belongsTo(tipoPrueba, { foreignKey: 'id_script', sourceKey: 'script' });
module.exports = tipoPrueba;
