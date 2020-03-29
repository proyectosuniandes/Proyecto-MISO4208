const Version = require('../models/version');
const App = require('../models/app');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//Create and Save a new Version
exports.create = async (req, res) => {
  console.log('***** Create Version *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: 'File not parsed' });
      }
      if (Object.keys(files).length > 0) {
        uploadFile(
          files.ruta_app.path,
          files.ruta_app.name,
          fields,
          async fields => {
            const record = await Version.create(fields, {
              raw: true
            });
            res.status(201).json(record);
          }
        );
      } else {
        const record = await Version.create(fields, {
          raw: true
        });
        res.status(201).json(record);
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Version not created' });
  }
};

//Update a Version identified by the versionId and appId in the request
exports.update = async (req, res) => {
  console.log('***** Update Version *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      const record = await Version.findOne({
        where: {
          id_version: req.params.versionId,
          id_app: req.params.appId
        },
        raw: true
      });
      if (!record) {
        return res.status(404).json({ error: 'Version not found' });
      }
      const persist = async fields => {
        await Version.update(fields, {
          where: {
            id_version: req.params.versionId,
            id_app: req.params.appId
          }
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
    res.status(500).json({ message: 'Error updating Version' });
  }
};

//Delete a Version identified by the versionId and appId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Version *****');
  try {
    const record = await Version.findOne({
      where: {
        id_version: req.params.versionId,
        id_app: req.params.appId
      },
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    deleteFile(record.ruta_app, async () => {
      await Version.destroy({
        where: {
          id_version: req.params.versionId,
          id_app: req.params.appId
        }
      });
      res.json({ id_version: req.params.versionId });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Version' });
  }
};

//Retrieve a Version identified by the versionId and appId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Version *****');
  try {
    const record = await Version.findOne({
      where: {
        id_version: req.params.versionId,
        id_app: req.params.appId
      },
      include: App,
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Version' });
  }
};

// Retrieve all Versions from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Versions **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Version.findAndCountAll({
      include: App,
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

async function uploadFile(filePath, fileName, fields, persist) {
  const s3 = new AWS.S3();
  //Read content from file
  const fileContent = fs.readFileSync(filePath);
  //Setting up S3 upload parameters
  const params = {
    Bucket: 'miso-4208-grupo3/app',
    Key: fileName,
    Body: fileContent
  };
  //Uploading files to the bucket
  await s3.upload(params, async (err, data) => {
    if (err) {
      return err;
    }
    console.log('File uploaded successfully ' + data.Location);
    fields.ruta_app = data.Location;
    persist(fields);
  });
}

function deleteFile(rutaVersion, next) {
  const s3 = new AWS.S3();
  const oldFile = path.posix.basename(rutaVersion);
  // Setting up S3 delete parameters
  const paramsD = {
    Bucket: 'miso-4208-grupo3/app',
    Key: oldFile
  };
  // Deleting files to the bucket
  s3.deleteObject(paramsD, async function(err, data) {
    if (err) {
      throw err;
    }
    console.log('File deleted successfully. ' + data);
    next();
  });
}
