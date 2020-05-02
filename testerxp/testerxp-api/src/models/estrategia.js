const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const estrategiaPrueba = require('./estrategiaPrueba');
const dispositivos = require('./dispositivos');
const navegadores = require('./navegadores');

const estrategia = sequelize.define(
  'estrategia',
  {
    id_estrategia: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.TEXT,
    },
    estado: {
      type: Sequelize.ENUM('registrado', 'ejecutado', 'pendiente', 'cancelado'),
    },
    ruta_consolidado: {
      type: Sequelize.TEXT
    }
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

estrategia.hasMany(estrategiaPrueba, {
  as: 'estrategia',
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
estrategia.hasMany(dispositivos, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
estrategia.hasMany(navegadores, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});

estrategiaPrueba.belongsTo(estrategia, {
  as: 'estrategia',
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
dispositivos.belongsTo(estrategiaPrueba, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});
navegadores.belongsTo(estrategiaPrueba, {
  foreignKey: 'id_estrategia',
  sourceKey: 'id_estrategia',
});

module.exports = estrategia;
