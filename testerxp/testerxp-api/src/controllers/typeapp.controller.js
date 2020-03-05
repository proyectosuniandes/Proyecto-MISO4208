const TipoApp = require('../models/TipoApp');

exports.findAll = async (req, res) => {
    console.log("findAll");
    try {
        const {range, sort, filter} = req.query;
        const [from, to] = range ? JSON.parse(range) : [0, 100];
        const parsedFilter = filter ? parseFilter(filter) : {}
        const {count, rows} = await TipoApp.findAndCountAll({
            offset: from,
            limit: to - from + 1,
            order: [sort ? JSON.parse(sort) : ['id', 'ASC']],
            where: parsedFilter,
            raw: true,
        });
        res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
        res.set('X-Total-Count', `${count}`)
        res.json(rows);

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "couldn't retrieve tipoPruebas" });
    }

};

/*export const parseFilter = (filter: string) => {
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
};*/