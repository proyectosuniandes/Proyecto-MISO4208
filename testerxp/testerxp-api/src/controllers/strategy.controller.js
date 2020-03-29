const Strategy = require('../models/estrategia');
const sequelize = require('../database/database');
const { QueryTypes } = require('sequelize');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

//Create and Save a new Strategy
exports.create = async (req, res) => {
  console.log('***** Create Strategy *****');
  try {
    const record = await Strategy.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Strategy not created' });
  }
};

//Delete a Strategy identified by the strategyId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Strategy *****');
  try {
    await Strategy.destroy({
      where: { id_estrategia: req.params.strategyId }
    });
    res.json({ id_estrategia: req.params.strategyId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Strategy' });
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
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Strategy' });
  }
};

// Retrieve all Strategies from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Strategies *****');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Strategy.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_estrategia }))
    );
    res.json(
      rows.map(resource => ({ ...resource, id: resource.id_estrategia }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Strategies' });
  }
};

//Execute a Strategy
exports.execute = async (req, res) => {
  console.log('*****Execute Strategy *****');
  try {
    const record = await sequelize.query(
      'select e.id_estrategia , ep.id_ejecucion, p.id_prueba, v.id_app, v.ruta_app, p.tipo_prueba, (select p2.param from parametro p2 where p2.id_prueba =p.id_prueba) as parametro, (select s.ruta_script from script s where s.id_prueba =p.id_prueba ) from estrategia e, estrategia_prueba ep , prueba p, "version" v where e.id_estrategia =$strategyId and e.id_estrategia =ep.id_estrategia and p.id_prueba =ep.id_prueba and v.id_version =p.id_version and v.id_app =p.id_app ',
      {
        bind: {
          strategyId: req.params.strategyId
        },
        type: QueryTypes.SELECT,
        raw: true
      }
    );
    if (!record) {
      res.status(404).json({ message: 'Strategy not found' });
    }
    const sqs = new AWS.SQS();
    for (let i = 0; i < record.length; i++) {
      const params = {
        MessageBody: JSON.stringify(record[i]),
        QueueUrl:
          'https://sqs.us-east-1.amazonaws.com/973067341356/dispatcher.fifo',
        MessageGroupId:
          record[i].id_estrategia +
          '' +
          record[i].id_ejecucion +
          '' +
          record[i].id_prueba +
          '' +
          record[i].id_app,
        MessageDeduplicationId:
          record[i].id_estrategia +
          '' +
          record[i].id_ejecucion +
          '' +
          record[i].id_prueba +
          '' +
          record[i].id_app
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
