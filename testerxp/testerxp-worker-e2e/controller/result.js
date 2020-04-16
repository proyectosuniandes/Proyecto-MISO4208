const Result = require('../models/resultado');

const result = async (executionId, dir) => {
  return new Promise((resolve, reject) => {
    try {
      const record = Result.create(
        { id_ejecucion: executionId, ruta_archivo: dir, fecha: new Date() },
        { raw: true }
      );
      resolve(record);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

module.exports = result;