const Execution = require('../models/ejecucion');

// Retrieve all Executions from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Executions *****');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterExecution(filter) : {};
    const { count, rows } = await Execution.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      //order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
      where: parsedFilter,
      raw: true,
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map((resource) => ({ ...resource, id: resource.id_ejecucion }))
    );
    res.json(
      rows.map((resource) => ({ ...resource, id: resource.id_ejecucion }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Executions' });
  }
};

function parseFilterExecution(filter) {
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
