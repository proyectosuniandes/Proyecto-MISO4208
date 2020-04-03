const Strategy = require('../models/estrategia');
const formidable = require('formidable');
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

// Retrieve all Strategies from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Strategies *****');
  try {
    const { range, sort, filter } = req.query;
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    //const parsedFilter = filter ? parseFilterVersion(filter) : {};
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
  console.log('***** Create Strategy *****');
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ message: 'File not parsed' });
    }
    try {
      const estrategia = {
        nombre: fields.nom_estrategia,
        estado: 'registrado',
      };
      const { dataValues } = await Strategy.create(estrategia, {
        raw: true,
      });
      if (fields.tipo_app === 'movil') {
        await Devices.create(dataValues.id_estrategia, fields.dispositivos);
      } else {
        await Browsers.create(
          dataValues.id_estrategia,
          fields.firefox,
          fields.chrome
        );
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
        await StrategyTest.create(
          dataValues.id_estrategia,
          resPrueba.dataValues.id_prueba
        );
        if (fields.tipo_app === 'movil') {
          if (p === 'E2E') {
            Script.create(resPrueba.dataValues.id_prueba, files.filesE2E);
          } else if (p === 'random') {
            Parameter.create({
              id_prueba: resPrueba.dataValues.id_prueba,
              param:
                './adb shell monkey -p ' +
                fields.paquete +
                ' --pct-syskeys 0 -s ' +
                fields.semillaRandom +
                ' ' +
                fields.numEventos,
            });
          } else if (p === 'BDT') {
            Script.create(resPrueba.dataValues.id_prueba, files.filesBDT);
          }
        } else {
          if (p === 'E2E') {
            Script.create(resPrueba.dataValues.id_prueba, files.filesE2E);
          } else if (p === 'random') {
            Script.create(resPrueba.dataValues.id_prueba, files.filesRANDOM);
          } else if (p === 'BDT') {
            Script.create(resPrueba.dataValues.id_prueba, files.filesBDT);
          }
        }
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Strategy not created' });
    }
  });
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
      'select p.id_prueba, v.id_app, v.ruta_app, p.tipo_prueba, (select p2.param from parametro p2 where ' +
        'p2.id_prueba =p.id_prueba) as parametro, (select s.ruta_script from script s where s.id_prueba ' +
        '=p.id_prueba ) as ruta_script from estrategia_prueba ep, prueba p, "version" v where ' +
        'ep.id_estrategia=$strategyId and ep.id_prueba =p.id_prueba and p.id_version =v.id_version and ' +
        'p.id_app =v.id_app',
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
    const sqs = new AWS.SQS();
    for (let i = 0; i < record.length; i++) {
      const executions = await Execution.create(
        {
          id_estrategia: req.params.strategyId,
          id_prueba: record[i].id_prueba,
          estado: 'registrado',
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
    res.status(500).json({ message: 'error executing Strategy' });
  }
};
