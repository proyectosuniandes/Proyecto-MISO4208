module.exports = app => {
  const Parameters = require('../controllers/parameter.controller.js');

  //Create a new Parameter
  app.post('/parameters', Parameters.create);

  //Update a Parameter with ParameterId
  app.put('/parameters/:parameterId', Parameters.update);

  //Delete a Parameter with ParameterId
  app.delete('/parameters/:parameterId', Parameters.delete);

  //Retrieve a sigle Parameter with ParameterId
  app.get('/parameters/:parameterId', Parameters.findOne);

  //Retrieve all Parameters
  app.get('/parameters', Parameters.findAll);
};
