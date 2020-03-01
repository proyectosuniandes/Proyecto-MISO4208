module.exports = (app) => {
    const TypeApp = require('../controllers/typeapp.controller.js');

    app.get('/typeApp', TypeApp.findAll);
};