module.exports = app => {
  const TestTypes = require('../controllers/testtype.controller.js');

  // Create a new TestType
  app.post('/testTypes', TestTypes.create);

  // Update a TestType with TestTypeId
  app.put('/testTypes/:testTypeId', TestTypes.update);

  // Delete a TestType with TestTypeId
  app.delete('/testTypes/:testTypeId', TestTypes.delete);

  // Retrieve a single TestType with TestTypeId
  app.get('/testTypes/:testTypeId', TestTypes.findOne);

  // Retrieve all Aplications
  app.get('/testTypes', TestTypes.findAll);
};
