const Parameter = require('../models/parametro');
const Test = require('../models/prueba');

//Create and Save a new Parameter
exports.create = async (req, res) => {
  console.log('***** Create Parameter *****');
  try {
    const record = await Parameter.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Parameter not created' });
  }
};

//Update a Parameter identified by the parameterId in the request
exports.update = async (req, res) => {
  console.log('***** Update Parameter *****');
  try {
    const record = await Parameter.findByPk(req.params.parameterId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Parameter not found' });
    }
    await Parameter.update(req.body, {
      where: { id_parametro: req.params.parameterId }
    });
    res.status(200).json(req.body);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Parameter' });
  }
};

//Delete a Parameter identified by the parameterId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Parameter *****');
  try {
    await Parameter.destroy({
      where: { id_parametro: req.params.parameterId }
    });
    res.json({ id_parametro: req.params.parameterId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Parameter' });
  }
};

//Retrieve a Parameter identified by the parameterId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Parameter *****');
  try {
    const record = await Parameter.findByPk(req.params.parameterId, {
      include: Test,
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Parameter not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Parameter' });
  }
};

// Retrieve all Parameters from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Parameters *****');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Parameter.findAndCountAll({
      include: Test,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_parametro', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_parametro }))
    );
    res.json(
      rows.map(resource => ({ ...resource, id: resource.id_parametro }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Parameters' });
  }
};
