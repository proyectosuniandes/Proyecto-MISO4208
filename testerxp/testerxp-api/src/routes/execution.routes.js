module.exports = (app) => {
  const Executions = require('../controllers/execution.controller.js');

  //Retrieve all Executions
  app.get('/executions', Executions.findAll);
};
