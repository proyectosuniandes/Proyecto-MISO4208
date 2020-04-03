module.exports = (app) => {
  const Strategies = require('../controllers/strategy.controller.js');

  //Retrieve all Strategies
  app.get('/strategies', Strategies.findAll);

  //Create a new Strategy
  app.post('/strategies', Strategies.create);

  //Delete a Strategy with StrategyId
  app.delete('/strategies/:strategyId', Strategies.delete);

  //Execute a Strategy
  app.get('/strategies/execute/:strategyId', Strategies.execute);
};
