const Test = require('../models/Prueba.js');
const Application = require('../models/App.js');
const TypeTest = require('../models/TipoPrueba.js');
const TypeApp = require('../models/TipoApp.js');

const { Op } = require("sequelize");

// Retrieve and return all Strategy from the database.
exports.findAll = async (req, res) => {
    console.log("**** FindAll Strategy **** ");
    try {
        const {range, sort, filter} = req.query;
        console.log(filter);
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilterApplication(filter) : {};

        const {count, rows} = await Application.findAndCountAll({
            include: [{
                model: Test,
                attributes: [['app', 'id_app']],
                required:true,
            }, {
                model: TypeApp,
            }],
            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort) : ['id_app', 'ASC']],
            where: parsedFilter,
            raw: true,
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`);
        console.log(rows.map(resource => ({...resource, id: resource.id_app})));
        res.json(rows.map(resource => ({...resource, id: resource.id_app})));
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "couldn't retrieve Applications"});
    }
};

// Find a single Application with a AplicationId
exports.findOne = async (req, res) => {
    console.log(req.params);
    try {
        console.log("****** FindOne Application ********");
        const record = await Application.findByPk(req.params.applicationId, {
            raw: true,
        })
        if (!record) {
            return res.status(404).json({error: 'Record not found'})
        }
        res.json(record)
    } catch (error) {
        console.log(e);
        res.status(500).json({message: "couldn't retrieve Application"});
    }
};



function parseFilterApplication(filter)  {
    console.log("Application Filter --->"+filter.replace("id","id_app"));

    const filters = JSON.parse(filter.replace("id","id_app"));
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
