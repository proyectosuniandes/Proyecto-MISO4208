module.exports = app => {
  const StrategyTests = require('../controllers/strategyTest.controller.js');

  //Create a new StrategyTest
  app.post('/strategyTests', StrategyTests.create);

  //Delete a StrategyTest with StrategyTestId
  app.delete('/strategyTests/:strategyId/:testId', StrategyTests.delete);

  //Retrieve a sigle StrategyTest with StrategyTestId
  app.get('/strategyTests/:strategyId/:testId', StrategyTests.findOne);

  //Retrieve all StrategyTests
  app.get('/strategyTests', StrategyTests.findAll);
};
