module.exports = app => {
  const Scripts = require('../controllers/script.controller.js');

  //Create a new Parameter
  app.post('/scripts', Scripts.create);

  //Update a Parameter with ParameterId
  app.put('/scripts/:scriptId', Scripts.update);

  //Delete a Parameter with ParameterId
  app.delete('/scripts/:scriptId', Scripts.delete);

  //Retrieve a sigle Parameter with ParameterId
  app.get('/scripts/:scriptId', Scripts.findOne);

  //Retrieve all Scripts
  app.get('/scripts', Scripts.findAll);
};
