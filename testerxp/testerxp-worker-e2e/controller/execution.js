const Execution = require('../models/ejecucion');

//Update execution given executionId
const execution = async (executionId, estado) => {
  let fecha_fin = null;
  if (estado === 'ejecutado') {
    fecha_fin = new Date();
  }
  await Execution.update(
    { estado, fecha_fin },
    {
      where: {
        id_ejecucion: executionId,
      },
    }
  );
};

module.exports = execution;