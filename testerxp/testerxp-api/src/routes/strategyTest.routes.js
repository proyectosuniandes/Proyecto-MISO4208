module.exports = (app) => {
  const StrategyTests = require('../controllers/strategyTest.controller.js');

  //Retrieve all StrategyTests
  app.get('/strategyTests', StrategyTests.findAll);

  //Retrieve a sigle StrategyTest with StrategyTestId
  app.get('/strategyTests/:strategyId', StrategyTests.findOne);
};
