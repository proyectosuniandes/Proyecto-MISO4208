const HistoricalTest = require('../models/HistoricoPrueba.js');
const Test = require('../models/Prueba.js');
const TestStatus = require('../models/EstadoPrueba.js');

// Create and Save a new HistoricalTest
exports.create = async (req, res) => {
  console.log('***** Create HistoricalTests ******');
  try {
    const record = await HistoricalTest.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'HistoricalTests not created' });
  }
};

// Retrieve and return all HistoricalTests from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll HistoricalTests **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterHistoricalTest(filter) : {};
    const { count, rows } = await HistoricalTest.findAndCountAll({
      include: [Test, TestStatus],
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_his', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(rows.map(resource => ({ ...resource, id: resource.id_his })));
    res.json(rows.map(resource => ({ ...resource, id: resource.id_his })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve HistoricalTests" });
  }
};

// Find a single HistoricalTest with a HistoricalTestId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne HistoricalTest ********');
    const record = await HistoricalTest.findByPk(req.params.historicalTestId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve HistoricalTest" });
  }
};

// Update a HistoricalTest identified by the HistoricalTestId in the request
exports.update = async (req, res) => {
  console.log('****** Update HistoricalTests *****');

  try {
    const record = await HistoricalTest.findByPk(req.params.historicalTestId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'HistoricalTest not found' });
    }
    const data = req.body;
    await HistoricalTest.update(data, {
      where: { id_his: req.params.historicalTestId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update HistoricalTest" });
  }
};

// Delete a HistoricalTest with the specified HistoricalTestId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete HistoricalTest*******');
  try {
    await HistoricalTest.destroy({
      where: { id_his: req.params.historicalTestId }
    });
    res.json({ id: req.params.historicalTestId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete HistoricalTest" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterHistoricalTest(filter)  {
    console.log("HistoricalTest Filter --->"+filter.replace("id","id_his"));

    const filters = JSON.parse(filter.replace("id","id_his"));

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
