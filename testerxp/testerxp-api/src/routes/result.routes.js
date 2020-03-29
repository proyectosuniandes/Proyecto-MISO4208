module.exports = app => {
  const Results = require('../controllers/result.controller.js');

  //Create a new Result
  app.post('/results', Results.create);

  //Update a Result with ResultId
  app.put('/results/:resultId', Results.update);

  //Delete a Result with ResultId
  app.delete('/results/:resultId', Results.delete);

  //Retrieve a sigle Result with ResultId
  app.get('/results/:resultId', Results.findOne);

  //Retrieve all Results
  app.get('/results', Results.findAll);
};
