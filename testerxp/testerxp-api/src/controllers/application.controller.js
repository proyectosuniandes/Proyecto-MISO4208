const Application = require('../models/app.js');

// Create and Save a new Application
exports.create = async (req, res) => {
  console.log('***** Create Applications ******');
  try {
    const record = await Application.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Applications not created' });
  }
};

// Retrieve and return all Applications from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Applications **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterApplication(filter) : {};
    const { count, rows } = await Application.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_app', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(rows.map(resource => ({ ...resource, id: resource.id_app })));
    res.json(rows.map(resource => ({ ...resource, id: resource.id_app })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Applications' });
  }
};

// Find a single Application with a ApplicationId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Application ********');
    const record = await Application.findByPk(req.params.applicationId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Application' });
  }
};

// Update a Application identified by the ApplicationId in the request
exports.update = async (req, res) => {
  console.log('****** Update Applications *****');

  try {
    const record = await Application.findByPk(req.params.applicationId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const data = req.body;
    await Application.update(data, {
      where: { id_app: req.params.applicationId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error updating Application' });
  }
};

// Delete a Application with the specified ApplicationId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Application*******');
  try {
    await Application.destroy({
      where: { id_app: req.params.applicationId }
    });
    res.json({ id: req.params.applicationId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error deleting Application' });
  }
};
