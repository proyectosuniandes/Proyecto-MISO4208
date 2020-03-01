
module.exports = (app) => {

    const Applications = require('../controllers/application.controller.js');

    // Create a new Application
    app.post('/applications', Applications.create);
    // Update a Application with AplicationId
    app.put('/applications/:applicationId', Applications.update);

    // Delete a Application with AplicationId
    app.delete('/applications/:applicationId', Applications.delete);

    // Retrieve a single Application with AplicationId
    app.get('/applications/:applicationId', Applications.findOne);

    // Retrieve all Aplications
    app.get('/applications', Applications.findAll);
};


