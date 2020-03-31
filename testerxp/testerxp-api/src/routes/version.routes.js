module.exports = app => {
  const Versions = require('../controllers/version.controller.js');

  //Create a new Parameter
  app.post('/versions', Versions.create);

  //Update a Parameter with ParameterId
  app.put('/versions/:versionId', Versions.update);

  //Delete a Parameter with ParameterId
  app.delete('/versions/:versionId/:appId', Versions.delete);

  //Retrieve a sigle Parameter with ParameterId
  app.get('/versions/:versionId/:appId', Versions.findOne);

  app.get('/versions/:versionId', Versions.findOne);

  //Retrieve all Versions
  app.get('/versions', Versions.findAll);
};
