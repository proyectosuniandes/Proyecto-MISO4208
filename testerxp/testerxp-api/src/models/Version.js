const { Sequelize } = require('sequelize');
const sequelize = require('../databse/database');
const app = require('./App');

const version = sequelize.define(
  'version',
  {
    id_version: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    descripcion: {
      type: Sequelize.TEXT
    },
    ruta_app: {
      type: Sequelize.TEXT
    },
    app: {
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

version.hasMany(app, { foreignKey: 'app', sourceKey: 'id_app' });
app.belongsTo(version, { foreignKey: 'app', sourceKey: 'id_app' });

module.exports = version;
