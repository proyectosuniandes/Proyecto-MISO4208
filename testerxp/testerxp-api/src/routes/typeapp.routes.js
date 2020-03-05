module.exports = (app) => {
    const TypeApp = require('../controllers/typeapp.controller.js');

    app.get('/typeApp', TypeApp.findAll)

    // Retrieve a single Application with AplicationId
    app.get('/typeApp/:typeAppId', TypeApp.findOne);
};