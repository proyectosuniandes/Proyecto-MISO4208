const TipoApp = require('../models/TipoApp');

exports.findAll = async (req, res) => {
    console.log("****** FindAll TipoApp *****");
    try {
        const {range, sort, filter} = req.query;
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilterTypeApp(filter) : {}
        const {count, rows} = await TipoApp.findAndCountAll({
            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort.replace("id","id_tipo_app")) : ['id_tipo_app', 'ASC']],
            where: parsedFilter,
            raw: true,
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`);
        console.log({data: rows.map(resource => ({...resource, id: resource.id_tipo_app}))});
        //rows.map(resource => ({...resource, id: resource.id_tipo_app}))

        res.json(rows.map(resource => ({...resource, id: resource.id_tipo_app})));

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "couldn't retrieve tipoPruebas" });
    }

};


// Find a single Application with a AplicationId
exports.findOne = async (req, res) => {

    try {
        console.log("****** FindOne TipoApp ********");
        const record = await TipoApp.findByPk(req.params.typeAppId, {
            raw: true,
        })
        if (!record) {
            return res.status(404).json({error: 'Record not found'})
        }
        res.json(record)
    } catch (error) {
        console.log(e);
        res.status(500).json({message: "couldn't retrieve app"});
    }
};

function parseFilterTypeApp(filter)   {
    console.log("------------------>"+filter.replace("id","id_tipo_app"));
    const filters = JSON.parse(filter.replace("id","id_tipo_app"));
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