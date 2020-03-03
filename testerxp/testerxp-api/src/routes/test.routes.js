
module.exports = (app) => {

    const test = require('../controllers/test.controller.js');

    // Create a new test
    app.post('/test', test.create);
    // Update a test with testId
    app.put('/test/:testId', test.update);

    // Delete a test with testId
    app.delete('/test/:testId', test.delete);

    // Retrieve a single test with testId
    app.get('/test/:testId', test.findOne);

    // Retrieve all test
    app.get('/test', test.findAll);
};


