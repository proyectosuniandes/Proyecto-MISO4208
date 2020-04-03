const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const parametro = require('./parametro');
const script = require('./script');
const estrategiaPrueba = require('./estrategiaPrueba');

const prueba = sequelize.define(
  'prueba',
  {
    id_prueba: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_version: {
      type: Sequelize.INTEGER,
    },
    id_app: {
      type: Sequelize.INTEGER,
    },
    tipo_prueba: {
      type: Sequelize.ENUM('E2E', 'random', 'BDT'),
    },
    modo_prueba: {
      type: Sequelize.ENUM('headless', 'headful'),
    },
    vrt: {
      type: Sequelize.BOOLEAN,
    },
    ref_version: {
      type: Sequelize.INTEGER,
    },
    ref_app: {
      type: Sequelize.INTEGER,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

prueba.hasMany(parametro, { foreignKey: 'id_prueba', sourceKey: 'id_prueba' });
prueba.hasMany(script, { foreignKey: 'id_prueba', sourceKey: 'id_prueba' });
prueba.hasMany(estrategiaPrueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'id_prueba',
});
parametro.belongsTo(prueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'id_prueba',
});
script.belongsTo(prueba, { foreignKey: 'id_prueba', sourceKey: 'id_prueba' });
estrategiaPrueba.belongsTo(prueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'id_prueba',
});

module.exports = prueba;
