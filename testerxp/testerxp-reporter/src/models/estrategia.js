const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const estrategiaPrueba = require('./estrategiaPrueba');

const estrategia = sequelize.define(
  'estrategia',
  {
    id_estrategia: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ruta_consolidado: {
      type: Sequelize.TEXT
    },
    estado: {
      type: Sequelize.ENUM('registrado', 'ejecutado', 'pendiente', 'cancelado'),
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

estrategia.hasMany(estrategiaPrueba, {
  as: 'estrategia',
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia'
});
estrategiaPrueba.belongsTo(estrategia, {
  as: 'estrategia',
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia'
});

module.exports = estrategia;
