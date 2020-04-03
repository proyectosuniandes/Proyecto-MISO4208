const Strategy = require('../models/estrategia');
<<<<<<< HEAD
const formidable = require('formidable');
const Test = require('./test.controller');
=======
const StrategyTest = require('../models/estrategiaPrueba');
const sequelize = require('../database/database');
const {QueryTypes} = require('sequelize');
const Execution = require('../models/ejecucion');
const AWS = require('aws-sdk');
const util = require('util');
AWS.config.update({region: 'us-east-1'});

//Create and Save a new Strategy
exports.create = async (req, res) => {
    console.log('***** Create Strategy *****');
    console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
    console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));
    console.log('req.header : ' + util.inspect(req.header, false, null, true /*enable colors */));
    try {
        const record = await Strategy.create(req.body, {
            raw: true
        });
        res.status(201).json(record);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Strategy not created'});
    }
};




//Update a Strategy identified by the strategyId in the request
exports.update = async (req, res) => {
    console.log('***** Update Strategy *****');
    try {
        const record = await Strategy.findByPk(req.params.strategyId, {
            raw: true
        });
        if (!record) {
            return res.status(404).json({error: 'Strategy not found'});
        }
        await Strategy.update(req.body, {
            where: {id_estrategia: req.params.strategyId}
        });
        res.status(200).json(req.body);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error updating Execution'});
    }
};

//Delete a Strategy identified by the strategyId in the request
exports.delete = async (req, res) => {
    console.log('***** Delete Strategy *****');
    try {
        await Strategy.destroy({
            where: {id_estrategia: req.params.strategyId}
        });
        res.json({id_estrategia: req.params.strategyId});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error deleting Strategy'});
    }
};

//Retrieve a Strategy identified by the strategyId in the request
exports.findOne = async (req, res) => {
    console.log('***** FindOne Strategy *****');
    try {
        const record = await Strategy.findByPk(req.params.strategyId, {
            raw: true
        });
        if (!record) {
            return res.status(404).json({error: 'Strategy not found'});
        }
        res.status(200).json(record);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error retrieving Strategy'});
    }
};
>>>>>>> master

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
