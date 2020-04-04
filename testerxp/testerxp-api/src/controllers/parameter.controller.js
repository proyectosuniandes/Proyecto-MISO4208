const Parameter = require('../models/parametro');

//Create and Save a new Parameter
exports.create = async (parameter) => {
  console.log('***** Create Parameter *****');
  try {
    await Parameter.create(parameter, {
      raw: true,
    });
  } catch (e) {
    console.log(e);
  }
};
