const Test = require('../models/Prueba');
const Version = require('../models/Version');

//Create and Save a new Test
exports.create = async (req, res) => {
  console.log('***** Create Test *****');
  console.log(util.inspect(req.body, false, null, true /*enable colors */));
  try {
    const record = await Test.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Test not created' });
  }
};

//Update a Test identified by the testId in the request
exports.update = async (req, res) => {
  console.log('***** Update Test *****');
  console.log(util.inspect(req.body, false, null, true /*enable colors */));
  try {
    const record = await Test.findByPk(req.params.testId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Test not found' });
    }
    await Test.update(req.body, {
      where: { id_prueba: req.params.testId }
    });
    res.status(200).json(req.body);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating Test' });
  }
};

//Delete a Test identified by the testId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Test *****');
  console.log(util.inspect(req.body, false, null, true /*enable colors */));
  try {
    await Test.destroy({
      where: { id_prueba: req.params.testId }
    });
    res.json({ id_prueba: req.params.testId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting Test' });
  }
};

//Retrieve a Test identified by the testId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne Test *****');
  console.log(util.inspect(req.body, false, null, true /*enable colors */));
  try {
    const record = await Test.findByPk(req.params.testId, {
      include: Version,
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Test' });
  }
};

// Retrieve all Tests from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Tests *****');
  console.log(util.inspect(req.body, false, null, true /*enable colors */));
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Test.findAndCountAll({
      include: Version,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_prueba', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_prueba }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_prueba })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Tests' });
  }
};
