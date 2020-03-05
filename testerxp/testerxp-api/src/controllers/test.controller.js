const Test = require('../models/Prueba.js');
const App = require('../models/App.js');
const TypeTest = require('../models/TipoPrueba.js');

// Create and Save a new Test
exports.create = async (req, res) => {
    console.log("***** Create ******");
    try {
        const record = await Test.create(req.body,
            {
                raw: true,
            }
        );
        res.status(201).json(record);
    } catch (error) {
        console.log(e);
        res.status(500).json({message: 'Test not created'});
    }
};


// Retrieve and return all Aplications from the database.
exports.findAll = async (req, res) => {
    console.log("**** FindAll Test *****");
    try {
        const {range, sort, filter} = req.query;
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilterTest(filter) : {};
        console.log(sort);
        console.log(filter);
        const {count, rows} = await Test.findAndCountAll({
            include: [
                {
                    model: App,
                },
                {
                    model: TypeTest,
                }
            ],
            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
            where: parsedFilter,
            raw: true,
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`);
        console.log(rows.map(resource => ({...resource, id: resource.id_prueba})));
        res.json(rows.map(resource => ({...resource, id: resource.id_prueba})));
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "couldn't retrieve test"});
    }
};

// Find a single Test with a AplicationId
exports.findOne = async (req, res) => {
    console.log(req.params);
    try {
        console.log("****** FindOne ********");
        const record = await Test.findByPk(req.params.testId, {
            raw: true,
        })
        if (!record) {
            return res.status(404).json({error: 'Record not found'})
        }
        res.json(record)
    } catch (error) {
        console.log(e);
        res.status(500).json({message: "couldn't retrieve test"});
    }
};

// Update a Test identified by the AplicationId in the request
exports.update = async (req, res) => {
    console.log("****** Update *****");

    try {

        const record = await Test.findByPk(req.params.testId, {raw: true});

        if (!record) {
            return res.status(404).json({error: 'Record not found'})
        }

        const data = req.body;

        await Test.update(data, {where: {id_app: req.params.testId}});

        res.json(data)
    } catch (error) {
        console.log(e);
        res.status(500).json({message: "couldn't update test"});
    }


};

// Delete a Test with the specified AplicationId in the request
exports.delete = async (req, res) => {
    console.log("***** Delete *******");
    try {
        await Test.destroy({where: {id_app: req.params.testId}})
        res.json({id: req.params.testId})
    } catch (error) {
        console.log(e);
        res.status(500).json({message: "couldn't delete test"});
    }

};

function parseFilterTest(filter)   {
    const filters = JSON.parse(filter)
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


