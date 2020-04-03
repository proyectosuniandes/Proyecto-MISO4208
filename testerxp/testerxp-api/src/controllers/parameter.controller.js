const Parameter = require('../models/parametro');

//Create and Save a new Parameter
exports.create = async (parameter) => {
  console.log('***** Create Parameter *****');
  try {
    const record = await Parameter.create(parameter, {
      raw: true,
    });
    return record;
  } catch (e) {
    console.log(e);
    return null;
  }
};
