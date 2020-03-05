module.exports = app => {
  const TestStatus = require('../controllers/teststatus.controller.js');

  // Create a new TestStatus
  app.post('/testStatus', TestStatus.create);

  // Update a TestStatus with testStatusId
  app.put('/testStatus/:testStatusId', TestStatus.update);

  // Delete a TestStatus with testStatusId
  app.delete('/testStatus/:testStatusId', TestStatus.delete);

  // Retrieve a single TestStatus with testStatusId
  app.get('/testStatus/:testStatusId', TestStatus.findOne);

  // Retrieve all Aplications
  app.get('/testStatus', TestStatus.findAll);
};
