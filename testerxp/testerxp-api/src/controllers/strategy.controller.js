const Strategy = require('../models/estrategia');
const Devices = require('./devices.controller');
const Browsers = require('./browsers.controller');
const Test = require('./test.controller');
const StrategyTest = require('./strategyTest.controller');
const Script = require('./script.controller');
const Parameter = require('./parameter.controller');
const sequelize = require('../database/database');
const { QueryTypes } = require('sequelize');
const Execution = require('../models/ejecucion');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

// Retrieve all Strategies from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Strategies *****');
  try {
    const { range, sort, filter } = req.query;
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterStrategy(filter) : {};
    const { count, rows } = await Strategy.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
      where: parsedFilter,
      raw: true,
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);
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
  console.log('***** Create Strategy *****');
  try {
    const estrategia = {
      nombre: req.body.nom_estrategia,
      estado: 'registrado',
    };
    const { dataValues } = await Strategy.create(estrategia, {
      raw: true,
    });
    if (req.body.tipo_app === 'movil') {
      await Devices.create(dataValues.id_estrategia, req.body.dispositivos);
    } else {
      await Browsers.create(
        dataValues.id_estrategia,
        req.body.electron,
        req.body.chrome
      );
    }
    for (let i = 0; i < req.body.pruebas.length; i++) {
      let prueba = {
        id_version: req.body.version_app,
        id_app: req.body.id_app,
        tipo_prueba: req.body.pruebas[i],
        modo_prueba: req.body.modo,
        vrt: false,
      };
      if (req.body.vrt) {
        (prueba.vrt = true), (prueba.ref_app = req.body.id_app);
        prueba.ref_version = req.body.version_vrt;
      }
      const resPrueba = await Test.create(prueba);
      await StrategyTest.create(
        dataValues.id_estrategia,
        resPrueba.dataValues.id_prueba
      );
      if (req.body.tipo_app === 'movil') {
        if (req.body.pruebas[i] === 'E2E') {
          req.body.files.forEach((f) => {
            if (f.prueba === req.body.pruebas[i]) {
              Script.create(
                resPrueba.dataValues.id_prueba,
                f.base64File,
                f.name
              );
            }
          });
        } else if (req.body.pruebas[i] === 'random') {
          Parameter.create({
            id_prueba: resPrueba.dataValues.id_prueba,
            param:
              '-p ' +
              req.body.paquetes +
              ' --pct-syskeys 0 -s ' +
              req.body.semillaRandom +
              ' ' +
              req.body.numEventos,
          });
        } else if (req.body.pruebas[i] === 'BDT') {
          req.body.files.forEach((f) => {
            if (f.prueba === req.body.pruebas[i]) {
              Script.create(
                resPrueba.dataValues.id_prueba,
                f.base64File,
                f.name
              );
            }
          });
        }
      } else {
        if (req.body.pruebas[i] === 'E2E') {
          req.body.files.forEach((f) => {
            if (f.prueba === req.body.pruebas[i]) {
              Script.create(
                resPrueba.dataValues.id_prueba,
                f.base64File,
                f.name
              );
            }
          });
        } else if (req.body.pruebas[i] === 'random') {
          req.body.files.forEach((f) => {
            if (f.prueba === 'RANDOM') {
              Script.create(
                resPrueba.dataValues.id_prueba,
                f.base64File,
                f.name
              );
            }
          });
        } else if (req.body.pruebas[i] === 'BDT') {
          req.body.files.forEach((files) => {
            if (files[0] !== undefined) {
              if (files[0].prueba === req.body.pruebas[i]) {
                let baseFiles = [];
                let fileNames = [];
                files.forEach((f) => {
                  baseFiles.push(f.base64File);
                  fileNames.push(f.name);
                });
                Script.create(
                  resPrueba.dataValues.id_prueba,
                  baseFiles,
                  fileNames
                );
              }
            }
          });
        }
      }
      if (i === req.body.pruebas.length - 1) {
        res.status(200).json(dataValues);
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Strategy not created' });
  }
};

//Delete a Strategy with StrategyId
exports.delete = async (req, res) => {
  console.log('***** Create Strategy *****');
  try {
    const record = await Strategy.findByPk(req.params.strategyId, {
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    await Strategy.update(
      { estado: 'cancelado' },
      {
        where: { id_estrategia: req.params.strategyId },
      }
    );
    res.status(200).json(req.params.strategyId);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Execution' });
  }
};

//Execute a Strategy
exports.execute = async (req, res) => {
  console.log('*****Execute Strategy *****');
  try {
    await Strategy.update(
      { estado: 'pendiente' },
      {
        where: { id_estrategia: req.params.strategyId },
      }
    );

    const record = await sequelize.query(
      'select p.id_prueba, v.id_app, v.ruta_app, p.tipo_prueba, p.vrt, (select p2.param from parametro p2 where p2.id_prueba=p.id_prueba) as parametro, (select s.ruta_script from script s where s.id_prueba=p.id_prueba) as ruta_script, (select v2.ruta_app from version v2 where p.ref_version =v2.id_version and p.ref_app =v2.id_app ) as ruta_app_vrt from estrategia_prueba ep, prueba p, version v where ep.id_estrategia=$strategyId and ep.id_prueba =p.id_prueba and p.id_version =v.id_version and p.id_app =v.id_app',
      {
        bind: {
          strategyId: req.params.strategyId,
        },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    if (!record) {
      res.status(404).json({ message: 'Strategy not found' });
    }
    const dispositivos = await Devices.findAll({
      id_estrategia: req.params.strategyId,
    });
    const navegadores = await Browsers.findAll({
      id_estrategia: req.params.strategyId,
    });
    const sqs = new AWS.SQS();
    for (let i = 0; i < record.length; i++) {
      const executions = await Execution.create(
        {
          id_estrategia: req.params.strategyId,
          id_prueba: record[i].id_prueba,
          estado: 'registrado',
          fecha_inicio: new Date(),
        },
        {
          raw: true,
        }
      );
      const params = {
        MessageBody: JSON.stringify({
          id_estrategia: req.params.strategyId,
          id_ejecucion: executions.dataValues.id_ejecucion,
          id_prueba: record[i].id_prueba,
          id_app: record[i].id_app,
          ruta_app: record[i].ruta_app,
          tipo_prueba: record[i].tipo_prueba,
          parametro: record[i].parametro,
          ruta_script: record[i].ruta_script,
          vrt: record[i].vrt,
          ruta_app_vrt: record[i].ruta_app_vrt,
          dispositivos: dispositivos
            ? dispositivos.map((d) => {
                return { uuid: d.dispositivo };
              })
            : null,
          navegadores: navegadores
            ? navegadores.map((n) => {
                return { tipo: n.navegador, version: n.version };
              })
            : null,
        }),
        QueueUrl:
          'https://sqs.us-east-1.amazonaws.com/973067341356/dispatcher.fifo',
        MessageGroupId:
          req.params.strategyId +
          '' +
          executions.dataValues.id_ejecucion +
          '' +
          record[i].id_prueba +
          '' +
          record[i].id_app,
        MessageDeduplicationId:
          req.params.strategyId +
          '' +
          executions.dataValues.id_ejecucion +
          '' +
          record[i].id_prueba +
          '' +
          record[i].id_app,
      };
      await sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log('Error', err);
        } else {
          console.log('Success', data.MessageId);
          if (i === record.length - 1) {
            res.sendStatus(200);
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error executing Strategy' });
  }
};

function parseFilterStrategy(filter) {
  console.log('Application Filter --->' + filter.replace('id', 'id_app'));

  const filters = JSON.parse(filter.replace('id', 'id_app'));

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
