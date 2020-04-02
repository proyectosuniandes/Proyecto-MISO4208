const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const prueba = require('./Prueba');

const version = sequelize.define(
  'version',
  {
    id_version: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_app: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    descripcion: {
      type: Sequelize.TEXT,
    },
    ruta_app: {
      type: Sequelize.TEXT,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

version.hasMany(prueba, { foreignKey: 'id_version', sourceKey: 'id_version' });
version.hasMany(prueba, { foreignKey: 'id_app', sourceKey: 'id_app' });
prueba.belongsTo(version, {
  foreignKey: 'id_version',
  sourceKey: 'id_version',
});
prueba.belongsTo(version, {
  foreignKey: 'id_app',
  sourceKey: 'id_app',
});
prueba.belongsTo(version, {
  foreignKey: 'ref_version',
  sourceKey: 'id_version',
});
prueba.belongsTo(version, {
  foreignKey: 'ref_app',
  sourceKey: 'id_app',
});

module.exports = version;
