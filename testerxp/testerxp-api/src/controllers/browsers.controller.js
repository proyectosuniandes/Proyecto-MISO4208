const Browsers = require('../models/navegadores');

//Create and Save a new Device
exports.create = async (strategyId, electron, chrome) => {
  console.log('***** Create Browsers*****');
  try {
    electron.forEach((e) => {
      Browsers.create({
        id_estrategia: strategyId,
        navegador: 'electron',
        version: e,
      });
    });

    chrome.forEach((c) => {
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
// Retrieve all Browsers from the database.
exports.findAll = async (filter) => {
  console.log('***** FindAll Browsers *****');
  try {
    const browsers = await Browsers.findAll({
      where: filter,
      raw: true,
    });
    if (browsers.length) {
      return browsers;
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};
