const { QueryTypes } = require('sequelize');
const sequelize = require('../database/database');

//Find strategyTest given strategyId and testId
const queryStrategy = async (executionId, testId, appId) => {
    try {
      const record = await sequelize.query(
        'select e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
        {
          bind: {
            executionId: executionId,
            testId: testId,
            appId: appId
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
module.exports = queryStrategy;
