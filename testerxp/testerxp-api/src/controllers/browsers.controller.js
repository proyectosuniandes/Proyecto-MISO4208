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
