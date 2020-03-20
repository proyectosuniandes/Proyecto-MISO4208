module.exports = app => {
  const Apps = require('../controllers/app.controller.js');

  //Create a new App
  app.post('/apps', Apps.create);

  //Update a App with AppId
  app.put('/apps/:appId', Apps.update);

  //Delete a App with AppId
  app.delete('/apps/:appId', Apps.delete);

  //Retrieve a sigle App with AppId
  app.get('/apps/:appId', Apps.findOne);

  //Retrieve all Apps
  app.get('/apps', Apps.findAll);
};
