const Strategy = require('../models/estrategia');
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

// Retrieve all Strategies from the database.
exports.findAll = async (req, res) => {
    console.log('***** FindAll Strategies *****');
    try {
        const {range, sort, filter} = req.query;
        console.log(filter);
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilterStrategy(filter) : {};
        const {count, rows} = await Strategy.findAndCountAll({

            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
            where: parsedFilter,
            raw: true
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`);

        console.log(
            rows.map(resource => ({...resource, id: resource.id_estrategia}))
        );
        res.json(
            rows.map(resource => ({...resource, id: resource.id_estrategia}))
        );
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'error retrieving Strategies'});
    }
};


function parseFilterStrategy(filter) {
  console.log("Application Filter --->" + filter.replace("id", "id_app"));

  const filters = JSON.parse(filter.replace("id", "id_app"));

  return Object.keys(filters)
      .map(key => {
        if (
            typeof filters[key] === 'string' &&
            filters[key].indexOf('%') !== -1
        ) {
          return {
            [key]: {[Op.like]: filters[key]},
          }
        }
        return {
          [key]: filters[key],
        }
      })
      .reduce(
          (whereAttributes, whereAttribute) => ({
            ...whereAttributes,
            ...whereAttribute,
          }),
          {}
      )
};

//Execute a Strategy
exports.execute = async (req, res) => {
    console.log('*****Execute Strategy *****');
    try {
        await Strategy.update(
            {estado: 'pendiente'},
            {
                where: {id_estrategia: req.params.strategyId}
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
                    strategyId: req.params.strategyId
                },
                type: QueryTypes.SELECT,
                raw: true
            }
        );
        if (!record) {
            res.status(404).json({message: 'Strategy not found'});
        }
        const sqs = new AWS.SQS();
        for (let i = 0; i < record.length; i++) {
            console.log(util.inspect(record[i], false, null, true /*enable colors */));

            const executions = await Execution.create(
                {
                    id_estrategia: req.params.strategyId,
                    id_prueba: record[i].id_prueba,
                    estado: 'registrado'
                },
                {
                    raw: true
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
                    ruta_script: record[i].ruta_script
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
                    record[i].id_app
            };
            await sqs.sendMessage(params, function (err, data) {
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
        res.status(500).json({message: 'error executing Strategy'});
    }
};
