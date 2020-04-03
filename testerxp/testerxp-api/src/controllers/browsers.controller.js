const Browsers = require('../models/navegadores');

//Create and Save a new Device
exports.create = async (strategyId, firefox, chrome) => {
  console.log('***** Create Devices*****');
  try {
    JSON.parse(firefox).forEach((f) => {
      Browsers.create({
        id_estrategia: strategyId,
        navegador: 'firefox',
        version: f,
      });
    });

    JSON.parse(chrome).forEach((c) => {
      Browsers.create({
        id_estrategia: strategyId,
        navegador: 'chrome',
        version: c,
      });
    });
    return true;
  } catch (e) {
    console.log(e);
    return null;
  }
};
