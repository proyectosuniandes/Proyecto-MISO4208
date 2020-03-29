module.exports = app => {
  const Strategies = require('../controllers/strategy.controller.js');

  //Create a new Parameter
  app.post('/strategies', Strategies.create);

  //Delete a Parameter with ParameterId
  app.delete('/strategies/:strategyId', Strategies.delete);

  //Retrieve a sigle Parameter with ParameterId
  app.get('/strategies/:strategyId', Strategies.findOne);

  //Retrieve all Strategies
  app.get('/strategies', Strategies.findAll);

  //Execute a Strategy
  app.get('/strategies/execute/:strategyId', Strategies.execute);
};
