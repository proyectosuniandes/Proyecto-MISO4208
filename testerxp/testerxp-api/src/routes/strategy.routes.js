
module.exports = (app) => {

    const Strategy = require('../controllers/strategy.controller.js');

    // Create a new Strategy
   // app.post('/strategy', Strategy.create);

    // Update a Strategy with StrategyId
   // app.put('/strategy/:strategyId', Strategy.update);

    // Delete a Strategy with StrategyId
    //app.delete('/strategy/:strategyId', Strategy.delete);

    // Retrieve a single Strategy with StrategyId
  //  app.get('/strategy/:strategyId', Strategy.findOne);

    // Retrieve all Strategy
    app.get('/strategy', Strategy.findAll);
};


