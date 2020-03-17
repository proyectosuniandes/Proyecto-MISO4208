module.exports = app => {
  const Scripts = require('../controllers/script.controller.js');

  // Create a new Script
  app.post('/scripts', Scripts.create);

  // Update a Script with ScriptId
  app.put('/scripts/:scriptId', Scripts.update);

  // Delete a Script with ScriptId
  app.delete('/scripts/:scriptId', Scripts.delete);

  // Retrieve a single Script with ScriptId
  app.get('/scripts/:scriptId', Scripts.findOne);

  // Retrieve all Aplications
  app.get('/scripts', Scripts.findAll);
};
