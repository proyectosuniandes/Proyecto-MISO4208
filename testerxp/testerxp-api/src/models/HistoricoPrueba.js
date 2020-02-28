const { Sequelize } = require('sequelize');
const sequelize = require('../database/database');
const prueba = require('./Prueba');
const estadoPrueba = require('./EstadoPrueba');

const historicoPrueba = sequelize.define(
  'historico_prueba',
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
      type: Sequelize.DATE
    },
    fecha_fin: {
      type: Sequelize.DATE
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

historicoPrueba.hasMany(prueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'prueba'
});
historicoPrueba.hasMany(estadoPrueba, {
  foreignKey: 'id_estado',
  sourceKey: 'estado'
});
prueba.belongsTo(historicoPrueba, {
  foreignKey: 'id_prueba',
  sourceKey: 'prueba'
});
estadoPrueba.belongsTo(historicoPrueba, {
  foreignKey: 'id_estado',
  sourceKey: 'estado'
});
module.exports = historicoPrueba;
