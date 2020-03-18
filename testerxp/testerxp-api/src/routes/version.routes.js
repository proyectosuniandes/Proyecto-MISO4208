module.exports = app => {
  const Versions = require('../controllers/version.controller.js');

  // Create a new Version
  app.post('/versions', Versions.create);

  // Update a Version with VersionId
  app.put('/versions/:versionId/:appId', Versions.update);

  // Delete a Version with VersionId
  app.delete('/versions/:versionId/:appId', Versions.delete);

  // Retrieve a single Version with VersionId
  app.get('/versions/:versionId/:appId', Versions.findOne);

  // Retrieve all Version
  app.get('/versions', Versions.findAll);
};
