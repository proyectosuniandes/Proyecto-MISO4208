module.exports = (app) => {
  const Tests = require('../controllers/test.controller.js');

  //Retrieve a sigle Test with TestId
  app.get('/tests/:testId', Tests.findOne);
};
