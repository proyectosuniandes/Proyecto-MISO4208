const Version = require('../models/version');
const App = require('../models/app');
const AWS = require('aws-sdk');
const path = require('path');

// Retrieve all Versions from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Versions **** ');
  try {
    const { range, sort, filter } = req.query;
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Version.findAndCountAll({
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
      rows.map((resource) => ({ ...resource, id: resource.id_version }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Versions' });
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
      return res.status(404).json({ error: 'Version not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Version' });
  }
};

//Create and Save a new Version
exports.create = async (req, res) => {
  console.log('***** Create Version *****');
  try {
    if (req.body.tipo_app === 'movil') {
      //Read content from file
      const file = new Buffer(req.body.files.base64File, 'base64');
      uploadFile(
        file,
        req.body.files.name,
        {
          id_app: req.body.id_app,
          descripcion: req.body.descripcion,
        },
        async (fields) => {
          const record = await Version.create(fields, {
            raw: true,
          });
          res.status(201).json(record);
        }
      );
    } else {
      delete req.body.tipo_app;
      const record = await Version.create(req.body, {
        raw: true,
      });
      res.status(201).json(record);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Version not created' });
  }
};

//Update a Version identified by the versionId and appId in the request
exports.update = async (req, res) => {
  console.log('***** Update Version *****');
  try {
    const record = await Version.findOne({
      where: {
        id_version: req.params.versionId,
      },
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    const persist = async (fields) => {
      await Version.update(fields, {
        where: {
          id_version: req.params.versionId,
        },
      });
      res.status(200).json(fields);
    };
    if (req.body.app.tipo_app === 'movil') {
      if (req.body.files) {
        const file = new Buffer(req.body.files.base64File, 'base64');
        const upload = () => {
          uploadFile(
            file,
            req.body.files.name,
            {
              id_app: req.body.id_app,
              descripcion: req.body.descripcion,
            },
            persist
          );
        };
        deleteFile(record.ruta_app, upload);
      } else {
        persist({
          id_app: req.body.id_app,
          descripcion: req.body.descripcion,
        });
      }
    } else {
      delete req.body.id_version;
      delete req.body.id_app;
      delete req.body['app.id_app'];
      delete req.body['app.nombre'];
      delete req.body['app.tipo_app'];
      delete req.body.id;
      delete req.body.app;
      persist(req.body);
    }
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
      },
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    deleteFile(record.ruta_app, async () => {
      await Version.destroy({
        where: {
          id_version: req.params.versionId,
        },
      });
      res.json({ id_version: req.params.versionId });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Version' });
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
          [key]: { [Op.like]: filters[key] },
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

async function uploadFile(file, fileName, fields, persist) {
  const s3 = new AWS.S3();
  //Setting up S3 upload parameters
  const params = {
    Bucket: 'miso-4208-grupo3/app',
    Key: fileName,
    Body: file,
  };
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
    Key: oldFile,
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
