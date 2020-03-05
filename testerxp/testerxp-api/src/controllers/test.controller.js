const Test = require('../models/Prueba.js');
const TestType = require('../models/TipoApp.js');
const Application = require('../models/App.js');
const Script = require('../models/Script.js');

// Create and Save a new Test
exports.create = async (req, res) => {
  console.log('***** Create Tests ******');
  try {
    const record = await Test.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Tests not created' });
  }
};

// Retrieve and return all Tests from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Tests **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterTest(filter) : {};
    const { count, rows } = await Test.findAndCountAll({
      include: [TestType, Application, Script],
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
    res.status(500).json({ message: "couldn't retrieve Tests" });
  }
};

// Find a single Test with a TestId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Test ********');
    const record = await Test.findByPk(req.params.testId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Test" });
  }
};

// Update a Test identified by the TestId in the request
exports.update = async (req, res) => {
  console.log('****** Update Tests *****');

  try {
    const record = await Test.findByPk(req.params.testId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Test not found' });
    }
    const data = req.body;
    await Test.update(data, {
      where: { id_prueba: req.params.testId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update Test" });
  }
};

// Delete a Test with the specified TestId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Test*******');
  try {
    await Test.destroy({
      where: { id_prueba: req.params.testId }
    });
    res.json({ id: req.params.testId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete Test" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterTest(filter)  {
    console.log("Test Filter --->"+filter.replace("id","id_prueba"));

    const filters = JSON.parse(filter.replace("id","id_prueba"));

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
*/
