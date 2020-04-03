const Strategy = require('../models/estrategia');
const formidable = require('formidable');
const Test = require('./test.controller');

// Retrieve all Strategies from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Strategies *****');
  try {
    const { range, sort, filter } = req.query;
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter; //? parseFilterVersion(filter) : {};
    const { count, rows } = await Strategy.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
      //where: parsedFilter,
      raw: true,
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map((resource) => ({ ...resource, id: resource.id_estrategia }))
    );
    res.json(
      rows.map((resource) => ({ ...resource, id: resource.id_estrategia }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Strategies' });
  }
};

//Create and Save a new Strategy
exports.create = async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ message: 'File not parsed' });
    }
    JSON.parse(fields.pruebas).forEach(async (p) => {
      let prueba = {
        id_version: fields.version_app,
        id_app: fields.id_app,
        tipo_prueba: p,
        modo_prueba: fields.modo,
        vrt: fields.vrt,
      };
      if (fields.vrt) {
        prueba.ref_app = fields.id_app;
        prueba.ref_version = fields.version_vrt;
      }
      const resPrueba = await Test.create(prueba);
      console.log(resPrueba);
    });
  });
};
