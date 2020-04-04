const Version = require('../models/Version');
const App = require('../models/App');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Retrieve all Versions from the database.
exports.findAll = async (req, res) => {
    console.log('**** FindAll Versions **** ');
    try {
        const {range, sort, filter} = req.query;
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilterVersion(filter) : {};
        const {count, rows} = await Version.findAndCountAll({
            include: App,
            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort) : ['id_version', 'ASC']],
            where: parsedFilter,
            raw: true,
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`);
        res.json(
            rows.map((resource) => ({...resource, id: resource.id_version}))
        );
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'error retrieving Versions'});
    }
};

//Retrieve a Version identified by the versionId and appId in the request
exports.findOne = async (req, res) => {
    console.log('***** FindOne Version *****');
    try {
        const record = await Version.findOne({
            where: {
                id_version: req.params.versionId,
            },
            include: App,
            raw: true,
        });
        if (!record) {
            return res.status(404).json({error: 'Version not found'});
        }
        res.status(200).json(record);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error retrieving Version'});
    }
};

//Create and Save a new Version
exports.create = async (req, res) => {
    console.log('***** Create Version *****');
    console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
    console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));
    try {


        //-- sube el archivo
        if (req.body.files) {
            var scriptBuffer = Buffer.from(req.body.files.base64File, 'base64');
            //fs.writeFileSync("imagen.jpg", scriptBuffer);
            var scriptName = req.body.files.name;
            req.body.ruta_app =  uploadFile(scriptName, scriptBuffer);
        }

        // -- Persiste ---------------
        const record = await Version.create(req.body, {
            raw: true,
        });

        res.status(201).json(record);


    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Version not created'});
    }
};

//Update a Version identified by the versionId and appId in the request
exports.update = async (req, res) => {
    console.log('***** Update Version *****');
    console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
    console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));
    try {
        const form = formidable({multiples: true});
        form.parse(req, async (err, fields, files) => {
            const record = await Version.findOne({
                where: {
                    id_version: req.params.versionId,
                },
                raw: true,
            });
            if (!record) {
                return res.status(404).json({error: 'Version not found'});
            }
            const persist = async (fields) => {
                await Version.update(fields, {
                    where: {
                        id_version: req.params.versionId,
                    },
                });
                res.status(200).json(fields);
            };
            if (Object.keys(files).length > 0) {
                const upload = () => {
                    uploadFile(files.ruta_app.path, files.ruta_app.name, fields, persist);
                };
                deleteFile(record.ruta_app, upload);
            } else {
                persist(fields);
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error updating Version'});
    }
};

//Delete a Version identified by the versionId and appId in the request
exports.delete = async (req, res) => {
    console.log('***** Delete Version *****');
    try {
        const record = await Version.findOne({
            where: {
                id_version: req.params.versionId,
            },
            raw: true,
        });
        if (!record) {
            return res.status(404).json({error: 'Version not found'});
        }
        deleteFile(record.ruta_app, async () => {
            await Version.destroy({
                where: {
                    id_version: req.params.versionId,
                },
            });
            res.json({id_version: req.params.versionId});
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error deleting Version'});
    }
};

function parseFilterVersion(filter) {
    console.log('Filter ---> ' + filter);
    if (JSON.parse(filter).hasOwnProperty('id')) {
        filter = filter.replace('id', 'id_version');
    }
    console.log('Replace Filter ---> ' + filter);

    //.replace("id", "id_app")

    const filters = JSON.parse(filter);

    return Object.keys(filters)
        .map((key) => {
            if (
                typeof filters[key] === 'string' &&
                filters[key].indexOf('%') !== -1
            ) {
                return {
                    [key]: {[Op.like]: filters[key]},
                };
            }
            return {
                [key]: filters[key],
            };
        })
        .reduce(
            (whereAttributes, whereAttribute) => ({
                ...whereAttributes,
                ...whereAttribute,
            }),
            {}
        );
}

async function uploadFile(scriptName, scriptBuffer) {

    const s3 = new AWS.S3();
    //Read content from file
   //const fileContent = fs.readFileSync(filePath);
    //Setting up S3 upload parameters
    const params = {
        Bucket: 'miso-4208-grupo3/app',
        Key: scriptName,
        Body: scriptBuffer,
    };
    //Uploading files to the bucket
    await s3.upload(params, async (err, data) => {
        if (err) {
            console.log(err)
            return err;
        }
        console.log('File uploaded successfully ' + data.Location);
        return data.Location;

    });
}

function deleteFile(rutaVersion, next) {
    const s3 = new AWS.S3();
    const oldFile = path.posix.basename(rutaVersion);
    // Setting up S3 delete parameters
    const paramsD = {
        Bucket: 'miso-4208-grupo3/app',
        Key: oldFile,
    };
    // Deleting files to the bucket
    s3.deleteObject(paramsD, async function (err, data) {
        if (err) {
            throw err;
        }
        console.log('File deleted successfully. ' + data);
        next();
    });
}
