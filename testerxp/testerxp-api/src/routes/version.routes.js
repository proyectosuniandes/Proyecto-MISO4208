module.exports = (app) => {
  const Versions = require('../controllers/version.controller.js');

  //Retrieve all Versions
  app.get('/versions', Versions.findAll);

  //Create a new Version
  app.post('/versions', Versions.create);

  /*//Update a Version with VersionId
  app.put('/versions/:versionId', Versions.update);

  //Delete a Version with VersionId
  app.delete('/versions/:versionId', Versions.delete);

  //Retrieve a sigle Version with VersionId
  app.get('/versions/:versionId', Versions.findOne);

  */
};
