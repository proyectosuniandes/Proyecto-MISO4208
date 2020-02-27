const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const prueba = require('./Prueba');
const estadoPrueba = require('./EstadoPrueba');

const historicoPrueba = sequelize.define(
  'historicoPrueba',
  {
    id_his: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    prueba: {
      type: Sequelize.INTEGER
    },
    estado: {
      type: Sequelize.INTEGER
    },
    fecha_inicio: {
      type: Sequelize.TIMESTAMP
    },
    fecha_fin: {
      type: Sequelize.TIMESTAMP
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

historicoPrueba.hasMany(prueba, {
  foreignKey: 'prueba',
  sourceKey: 'id_prueba'
});
historicoPrueba.hasMany(estadoPrueba, {
  foreignKey: 'estado',
  sourceKey: 'id_estado'
});
prueba.belongsTo(historicoPrueba, {
  foreignKey: 'prueba',
  sourceKey: 'id_prueba'
});
estadoPrueba.belongsTo({ foreignKey: 'estado', sourceKey: 'id_estado' });
module.exports = historicoPrueba;
