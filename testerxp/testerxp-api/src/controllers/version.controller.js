const Version = require('../models/version');
const App = require('../models/app');
const AWS = require('aws-sdk');

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

//Create and Save a new Version
exports.create = async (req, res) => {
  console.log('***** Create Version *****');
  try {
    if (req.body.tipo_app === 'movil') {
      //Read content from file
      const a = new Buffer(req.body.files.base64File, 'base64');
      uploadFile(
        a,
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
      console.log(req.body);
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
  console.log(file, fileName, fields, persist);
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
