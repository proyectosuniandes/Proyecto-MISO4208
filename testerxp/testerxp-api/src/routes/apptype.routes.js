module.exports = app => {
  const AppTypes = require('../controllers/apptype.controller.js');

  // Create a new AppType
  app.post('/appTypes', AppTypes.create);

  // Update a AppType with AppTypeId
  app.put('/appTypes/:appTypeId', AppTypes.update);

  // Delete a AppType with AppTypeId
  app.delete('/appTypes/:appTypeId', AppTypes.delete);

  // Retrieve a single AppType with AppTypeId
  app.get('/appTypes/:appTypeId', AppTypes.findOne);

  // Retrieve all Aplications
  app.get('/appTypes', AppTypes.findAll);
};
