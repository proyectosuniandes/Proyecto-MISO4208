module.exports = (app) => {
  const Apps = require('../controllers/app.controller.js');

  //Retrieve all Apps
  app.get('/apps', Apps.findAll);

  //Retrieve a sigle App with AppId
  app.get('/apps/:appId', Apps.findOne);

  //Create a new App
  app.post('/apps', Apps.create);

  //Update a App with AppId
  app.put('/apps/:appId', Apps.update);

  //Delete a App with AppId
  app.delete('/apps/:appId', Apps.delete);
};
