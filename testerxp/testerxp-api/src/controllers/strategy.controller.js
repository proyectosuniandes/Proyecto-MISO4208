const Strategy = require('../models/estrategia');

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
