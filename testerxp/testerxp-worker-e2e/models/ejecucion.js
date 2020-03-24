const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const estrategiaPrueba = require('./estrategiaPrueba');
const resultado = require('./resultado');

const ejecucion = sequelize.define(
  'ejecucion',
  {
    id_ejecucion: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: Sequelize.ENUM('registrado', 'ejecutado', 'pendiente')
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

ejecucion.hasMany(resultado, {
  foreignKey: 'id_ejecucion',
  sourceKey: 'id_ejecucion'
});
ejecucion.belongsTo(estrategiaPrueba, {
  foreignKey: 'id_ejecucion',
  sourceKey: 'id_ejecucion'
});
resultado.belongsTo(ejecucion, {
  foreignKey: 'id_ejecucion',
  sourceKey: 'id_ejecucion'
});

module.exports = ejecucion;
