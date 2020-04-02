const Execution = require('../models/ejecucion');

//Create and Save a new Execution
exports.create = async (req, res) => {
  console.log('***** Create Execution *****');
  try {
    const record = await Execution.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Execution not created' });
  }
};

//Update a Execution identified by the executionId in the request
exports.update = async (req, res) => {
  console.log('***** Update Execution *****');
  try {
    const record = await Execution.findByPk(req.params.executionId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    await Execution.update(req.body, {
      where: { id_ejecucion: req.params.executionId }
    });
    res.status(200).json(req.body);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Execution' });
  }
};

//Delete a Execution identified by the executionId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Execution *****');
  try {
    await Execution.destroy({
      where: { id_ejecucion: req.params.executionId }
    });
    res.json({ id_ejecucion: req.params.executionId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Execution' });
  }
};

//Retrieve a Execution identified by the executionId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Execution *****');
  try {
    const record = await Execution.findByPk(req.params.executionId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Execution' });
  }
};

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
      order: [sort ? JSON.parse(sort) : ['id_ejecucion', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_ejecucion }))
    );
    res.json(
      rows.map(resource => ({ ...resource, id: resource.id_ejecucion }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Executions' });
  }
};

function parseFilterExecution(filter) {
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