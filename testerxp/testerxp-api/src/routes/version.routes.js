module.exports = app => {
    const Versions = require('../controllers/version.controller.js');

    //Create a new Versions
    app.post('/versions', Versions.create);

    //Update a Versions with VersionsId
    app.put('/versions/:versionId', Versions.update);

    //Delete a Versions with VersionsId
    app.delete('/versions/:versionId', Versions.delete);

    //Retrieve a sigle Versions with VersionsId
    app.get('/versions/:versionId', Versions.findOne);

    //Retrieve all Versions
    app.get('/versions', Versions.findAll);
};
