const { QueryTypes } = require('sequelize');
const sequelize = require('../database/database');

//Find strategyTest given strategyId and testId
const idapp = async (appId, ruta) => {
    try {
        const record = await sequelize.query(
          'select v.id_version from version v where v.id_app=$appId and v.ruta_app= $ruta',
          {
            bind: {
              appId: appId,
              ruta: ruta
            },
            type: QueryTypes.SELECT,
            raw: true
          }
        );
        if (!record) {
          return null;
        }
        return record;
      } catch (e) {
        console.log(e);
        return null;
      }
}
module.exports = idapp;