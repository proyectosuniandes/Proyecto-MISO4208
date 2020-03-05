const TestStatus = require('../models/EstadoPrueba.js');

// Create and Save a new TestStatus
exports.create = async (req, res) => {
  console.log('***** Create TestStatus ******');
  try {
    const record = await TestStatus.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'TestStatus not created' });
  }
};

// Update a TestStatus identified by the TestStatusId in the request
exports.update = async (req, res) => {
  console.log('****** Update TestStatus *****');
  try {
    const record = await TestStatus.findByPk(req.params.testStatusId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'TestStatus not found' });
    }
    const data = req.body;
    await TestStatus.update(data, {
      where: { id_estado: req.params.testStatusId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update TestStatus" });
  }
};

// Delete a TestStatus with the specified TestStatusId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete TestStatus *******');
  try {
    await TestStatus.destroy({
      where: {
        id_estado: req.params.testStatusId
      }
    });
    res.json({ id: req.params.testStatusId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete TestStatus" });
  }
};

// Find a single TestStatus with a TestStatusId
exports.findOne = async (req, res) => {
  console.log('**** FindOne TestStatus **** ');
  try {
    const record = await TestStatus.findByPk(req.params.testStatusId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'TestStatus not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve TestStatus " });
  }
};

// Retrieve and return all TestStatus from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll TestStatus **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterApplication(filter) : {};
    const { count, rows } = await TestStatus.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_estado', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_estado }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_estado })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve TestStatus" });
  }
};
