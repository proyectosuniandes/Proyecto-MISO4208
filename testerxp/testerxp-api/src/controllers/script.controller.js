const Script = require('../models/script');
const Test = require('../models/prueba');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//Create and Save a new Script
exports.create = async (req, res) => {
  console.log('***** Create Script *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: 'File not parsed' });
      }
      uploadFile(
        files.ruta_script.path,
        files.ruta_script.name,
        fields,
        async fields => {
          const record = await Script.create(fields, {
            raw: true
          });
          res.status(201).json(record);
        }
      );
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Script not created' });
  }
};

//Update a Script identified by the scriptId in the request
exports.update = async (req, res) => {
  console.log('***** Update Script *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      const record = await Script.findByPk(req.params.scriptId, {
        raw: true
      });
      if (!record) {
        return res.status(404).json({ error: 'Script not found' });
      }
      const persist = async fields => {
        await Script.update(fields, {
          where: { id_script: req.params.scriptId }
        });
        res.status(200).json(fields);
      };
      if (Object.keys(files).length > 0) {
        const upload = () => {
          uploadFile(
            files.ruta_script.path,
            files.ruta_script.name,
            fields,
            persist
          );
        };
        deleteFile(record.ruta_script, upload);
      } else {
        persist(fields);
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Script' });
  }
};

//Delete a Script identified by the scriptId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Script *****');
  try {
    const record = await Script.findByPk(req.params.scriptId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Script not found' });
    }
    deleteFile(record.ruta_script, async () => {
      await Script.destroy({
        where: { id_script: req.params.scriptId }
      });
      res.json({ id_script: req.params.scriptId });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Script' });
  }
};

//Retrieve a Script identified by the scriptId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Script *****');
  try {
    const record = await Script.findByPk(req.params.scriptId, {
      include: Test,
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Script not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Script' });
  }
};

// Retrieve all Scripts from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Scripts **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Script.findAndCountAll({
      include: Test,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_script', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_script }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_script })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Scripts' });
  }
};

async function uploadFile(filePath, fileName, fields, persist) {
  const s3 = new AWS.S3();
  //Read content from file
  const fileContent = fs.readFileSync(filePath);
  //Setting up S3 upload parameters
  const params = {
    Bucket: 'miso-4208-grupo3/script/' + fields.id_prueba,
    Key: fileName,
    Body: fileContent
  };
  //Uploading files to the bucket
  await s3.upload(params, async (err, data) => {
    if (err) {
      return err;
    }
    console.log('File uploaded successfully ' + data.Location);
    fields.ruta_script = path.dirname(data.Location);
    persist(fields);
  });
}

function deleteFile(rutaScript, next) {
  const s3 = new AWS.S3();
  const split = rutaScript.split('.com/');
  const bucket = 'miso-4208-grupo3';
  const prefix = split[1];
  // Setting up S3 list parameters
  const paramsL = {
    Bucket: bucket,
    Prefix: prefix
  };
  s3.listObjects(paramsL, (err, data) => {
    if (err) {
      throw err;
    }
    // Setting up S3 delete parameters
    let paramsD = { Bucket: bucket, Delete: { Objects: [] } };
    data.Contents.forEach(d => {
      paramsD.Delete.Objects.push({ Key: d.Key });
    });
    // Deleting files to the bucket
    s3.deleteObjects(paramsD, async function(err, data) {
      if (err) {
        throw err;
      }
      console.log('File deleted successfully. ' + data);
      next();
    });
  });
}
