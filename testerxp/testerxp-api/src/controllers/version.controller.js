const Version = require('../models/version.js');
const Application = require('../models/app.js');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
AWS.config.update({
  region: 'us-east-2'
});

// Create and Save a new Version
exports.create = async (req, res) => {
  console.log('***** Create Versions ******');
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ message: 'File not parsed' });
    }
    const s3 = new AWS.S3();
    const uploadFile = async fileName => {
      // Read content from the file
      const fileContent = fs.readFileSync(fileName);
      // Setting up S3 upload parameters
      const params = {
        Bucket: 'miso-4208-grupo3/apk',
        Key: files.apk.name,
        Body: fileContent
      };
      // Uploading files to the bucket
      await s3.upload(params, async function(err, data) {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        fields.ruta_app = data.Location;
        console.log(fields);
        //persistencia en RDS
        try {
          const record = await Version.create(fields, {
            raw: true
          });
          res.status(201).json(record);
        } catch (e) {
          console.log(e);
          res.status(500).json({ message: 'Applications not created' });
        }
      });
    };

    uploadFile(files.apk.path);
  });
};

// Retrieve and return all Versions from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Versions **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Version.findAndCountAll({
      include: Application,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_version', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_version }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_version })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Versions' });
  }
};

// Find a single Version with a VersionId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Version ********');
    const record = await Version.findOne({
      include: Application,
      where: {
        id_version: req.params.versionId,
        id_app: req.params.appId
      }
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Version' });
  }
};

// Update a Version identified by the VersionId in the request
exports.update = async (req, res) => {
  console.log('****** Update Versions *****');
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    try {
      const record = await Version.findOne({
        where: {
          id_version: req.params.versionId,
          id_app: req.params.appId
        }
      });
      if (!record) {
        return res.status(404).json({ error: 'Version not found' });
      }
      if (Object.keys(files).length > 0) {
        const s3 = new AWS.S3();
        const deleteFile = () => {
          const oldFile = path.posix.basename(record.ruta_app);
          // Setting up S3 upload parameters
          const paramsD = {
            Bucket: 'miso-4208-grupo3/apk',
            Key: oldFile
          };
          // Deleting files to the bucket
          s3.deleteObject(paramsD, async function(err, data) {
            if (err) {
              throw err;
            }
            console.log(`File deleted successfully. ${data.Location}`);
          });
        };
        const uploadFile = fileName => {
          // Read content from the file
          const fileContent = fs.readFileSync(fileName);
          // Setting up S3 upload parameters
          const paramsU = {
            Bucket: 'miso-4208-grupo3/apk',
            Key: files.apk.name,
            Body: fileContent
          };
          // Uploading files to the bucket
          s3.upload(paramsU, async function(err, data) {
            if (err) {
              throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            fields.ruta_app = data.Location;
            console.log(fields);
            await Version.update(fields, {
              where: {
                id_version: req.params.versionId,
                id_app: req.params.appId
              }
            });
            res.json(fields);
          });
        };
        deleteFile();
        uploadFile(files.apk.path);
      } else {
        await Version.update(fields, {
          where: {
            id_version: req.params.versionId,
            id_app: req.params.appId
          }
        });
        res.json(fields);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'error updating Version' });
    }
  });
};

// Delete a Version with the specified VersionId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Version*******');
  try {
    const record = await Version.findOne({
      where: {
        id_version: req.params.versionId,
        id_app: req.params.appId
      }
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    const deleteFile = () => {
      const s3 = new AWS.S3();
      const oldFile = path.posix.basename(record.ruta_app);
      // Setting up S3 upload parameters
      const paramsD = {
        Bucket: 'miso-4208-grupo3/apk',
        Key: oldFile
      };
      // Deleting files to the bucket
      s3.deleteObject(paramsD, async function(err, data) {
        if (err) {
          throw err;
        }
        console.log(`File deleted successfully. ${data.Location}`);
      });
    };
    deleteFile();
    await Version.destroy({
      where: {
        id_version: req.params.versionId,
        id_app: req.params.appId
      }
    });
    res.json({
      id_version: req.params.versionId,
      id_app: req.params.appId
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error deleting Version' });
  }
};
