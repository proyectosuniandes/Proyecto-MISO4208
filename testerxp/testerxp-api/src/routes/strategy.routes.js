module.exports = (app) => {
  const Strategies = require('../controllers/strategy.controller.js');

  //Retrieve all Strategies
  app.get('/strategies', Strategies.findAll);

  //Create a new Strategy
  app.post('/strategies', Strategies.create);
};
