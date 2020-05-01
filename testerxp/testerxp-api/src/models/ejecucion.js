const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const resultado = require('./resultado');

const ejecucion = sequelize.define(
  'ejecucion',
  {
    id_ejecucion: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_estrategia: {
      type: Sequelize.INTEGER,
    },
    id_prueba: {
      type: Sequelize.INTEGER,
    },
    estado: {
      type: Sequelize.ENUM('registrado', 'ejecutado', 'pendiente', 'cancelado'),
    },
    fecha_inicio: {
      type: Sequelize.DATE,
    },
    fecha_fin: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

ejecucion.hasMany(resultado, {
  foreignKey: 'id_ejecucion',
  sourceKey: 'id_ejecucion',
});
resultado.belongsTo(ejecucion, {
  foreignKey: 'id_ejecucion',
  sourceKey: 'id_ejecucion',
});

module.exports = ejecucion;
