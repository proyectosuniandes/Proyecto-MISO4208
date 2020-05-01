const App = require('../models/App');
const util = require('util');

// Retrieve all Apps from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll Apps *****');
  console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
  console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));

  try {
    const { range, sort, filter } = req.query;
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterApplication(filter) : {};
    const { count, rows } = await App.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_app', 'ASC']],
      where: parsedFilter,
      raw: true,
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);
    res.json(rows.map((resource) => ({ ...resource, id: resource.id_app })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving Apps' });
  }
};

//Retrieve a App identified by the appId in the request

exports.findOne = async (req, res) => {
  console.log('***** FindOne App *****');
  console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
  console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));
  try {
    const record = await App.findByPk(req.params.appId, {
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving App' });
  }
};

//Create and Save a new App
exports.create = async (req, res) => {
  console.log('***** Create App *****');
  console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
  console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));

  try {
    const record = await App.create(req.body, {
      raw: true,
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'App not created' });
  }
};

//Update a App identified by the appId in the request
exports.update = async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  console.log('***** Update App *****');
  console.log('req.body : ' + util.inspect(req.body, false, null, true /*enable colors */));
  console.log('req.params : ' + util.inspect(req.params, false, null, true /*enable colors */));

  try {
    const record = await App.findByPk(req.params.appId, {
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'App not found' });
    }
    await App.update(req.body, {
      where: { id_app: req.params.appId },
    });
    res.status(200).json(req.body);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error updating App' });
  }
};

//Delete a App identified by the appId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete App *****');
  try {
    await App.destroy({
      where: { id_app: req.params.appId },
    });
    res.json({ id_app: req.params.appId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error deleting App' });
  }
};

function parseFilterApplication(filter) {
  console.log('Application Filter ---> ' + filter);
  if (JSON.parse(filter).hasOwnProperty('id')) {
    filter = filter.replace('id', 'id_app');
  }
  console.log('Application Replace Filter ---> ' + filter);

  const filters = JSON.parse(filter);

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
