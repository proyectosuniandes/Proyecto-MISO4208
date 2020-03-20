const Result = require('../models/resultado');
const Execution = require('../models/ejecucion');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//Create and Save a new Result
exports.create = async (req, res) => {
  console.log('***** Create Result *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: 'File not parsed' });
      }
      uploadFile(
        files.ruta_archivo.path,
        files.ruta_archivo.name,
        fields,
        async fields => {
          const record = await Result.create(fields, {
            raw: true
          });
          res.status(201).json(record);
        }
      );
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Result not created' });
  }
};

//Update a Result identified by the resultId in the request
exports.update = async (req, res) => {
  console.log('***** Update Result *****');
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      const record = await Result.findByPk(req.params.resultId, {
        raw: true
      });
      if (!record) {
        return res.status(404).json({ error: 'Result not found' });
      }
      const persist = async fields => {
        await Result.update(fields, {
          where: { id_resultado: req.params.resultId }
        });
        res.status(200).json(fields);
      };
      if (Object.keys(files).length > 0) {
        const upload = () => {
          uploadFile(
            files.ruta_archivo.path,
            files.ruta_archivo.name,
            fields,
            persist
          );
        };
        deleteFile(record.ruta_archivo, upload);
      } else {
        persist(fields);
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Result' });
  }
};

//Delete a Result identified by the resultId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Result *****');
  try {
    const record = await Result.findByPk(req.params.resultId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Result not found' });
    }
    deleteFile(record.ruta_archivo, async () => {
      await Result.destroy({
        where: { id_resultado: req.params.resultId }
      });
      res.json({ id_resultado: req.params.resultId });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Result' });
  }
};

//Retrieve a Result identified by the resultId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Result *****');
  try {
    const record = await Result.findByPk(req.params.resultId, {
      include: Execution,
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Result' });
  }
};

// Retrieve all Results from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Results **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Result.findAndCountAll({
      include: Execution,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_resultado', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_resultado }))
    );
    res.json(
      rows.map(resource => ({ ...resource, id: resource.id_resultado }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Results' });
  }
};

async function uploadFile(filePath, fileName, fields, persist) {
  const s3 = new AWS.S3();
  //Read content from file
  const fileContent = fs.readFileSync(filePath);
  //Setting up S3 upload parameters
  const params = {
    Bucket: 'miso-4208-grupo3/file',
    Key: fileName,
    Body: fileContent
  };
  //Uploading files to the bucket
  await s3.upload(params, async (err, data) => {
    if (err) {
      return err;
    }
    console.log('File uploaded successfully ' + data.Location);
    fields.ruta_archivo = data.Location;
    persist(fields);
  });
}

function deleteFile(rutaResult, next) {
  const s3 = new AWS.S3();
  const oldFile = path.posix.basename(rutaResult);
  // Setting up S3 delete parameters
  const paramsD = {
    Bucket: 'miso-4208-grupo3/file',
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
