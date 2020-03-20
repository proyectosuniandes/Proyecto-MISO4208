module.exports = app => {
  const Executions = require('../controllers/execution.controller.js');

  //Create a new Execution
  app.post('/executions', Executions.create);

  //Update a Execution with ExecutionId
  app.put('/executions/:executionId', Executions.update);

  //Delete a Execution with ExecutionId
  app.delete('/executions/:executionId', Executions.delete);

  //Retrieve a sigle Execution with ExecutionId
  app.get('/executions/:executionId', Executions.findOne);

  //Retrieve all Executions
  app.get('/executions', Executions.findAll);
};
