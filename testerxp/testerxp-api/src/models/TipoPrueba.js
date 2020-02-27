const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const script = require('./Script');
const tipoPrueba = sequelize.define(
  'tipoPrueba',
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

tipoPrueba.hasMany(script, { foreignKey: 'script', sourceKey: 'id_script' });
script.belongsTo(tipoPrueba, { foreignKey: 'script', sourceKey: 'id_script' });
module.exports = tipoPrueba;
