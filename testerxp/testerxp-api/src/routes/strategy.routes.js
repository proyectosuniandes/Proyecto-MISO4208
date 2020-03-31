module.exports = app => {
  const Strategies = require('../controllers/strategy.controller.js');

  //Create a new Strategy
  app.post('/strategies', Strategies.create);

  //Update a Strategy with StrategyId
  app.put('/strategies/:strategyId', Strategies.update);

  //Delete a Strategy with StrategyId
  app.delete('/strategies/:strategyId', Strategies.delete);

  //Retrieve a sigle Strategy with StrategyId
  app.get('/strategies/:strategyId', Strategies.findOne);

  //Retrieve all Strategies
  app.get('/strategies', Strategies.findAll);

  //Execute a Strategy
  app.get('/strategies/execute/:strategyId', Strategies.execute);
};
