module.exports = app => {
  const Results = require('../controllers/result.controller.js');

  //Create a new Parameter
  app.post('/results', Results.create);

  //Update a Parameter with ParameterId
  app.put('/results/:resultId', Results.update);

  //Delete a Parameter with ParameterId
  app.delete('/results/:resultId', Results.delete);

  //Retrieve a sigle Parameter with ParameterId
  app.get('/results/:resultId', Results.findOne);

  //Retrieve all Results
  app.get('/results', Results.findAll);
};
