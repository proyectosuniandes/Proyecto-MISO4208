const TestType = require('../models/TipoPrueba.js');

// Create and Save a new TestType
exports.create = async (req, res) => {
  console.log('***** Create TestTypes ******');
  try {
    const record = await TestType.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'TestTypes not created' });
  }
};

// Retrieve and return all TestTypes from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll TestTypes **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterTestType(filter) : {};
    const { count, rows } = await TestType.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_tipo', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(rows.map(resource => ({ ...resource, id: resource.id_tipo })));
    res.json(rows.map(resource => ({ ...resource, id: resource.id_tipo })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve TestTypes" });
  }
};

// Find a single TestType with a AplicationId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne TestType ********');
    const record = await TestType.findByPk(req.params.testTypeId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve TestType" });
  }
};

// Update a TestType identified by the AplicationId in the request
exports.update = async (req, res) => {
  console.log('****** Update TestTypes *****');

  try {
    const record = await TestType.findByPk(req.params.testTypeId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'TestType not found' });
    }
    const data = req.body;
    await TestType.update(data, {
      where: { id_tipo: req.params.testTypeId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update TestType" });
  }
};

// Delete a TestType with the specified AplicationId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete TestType*******');
  try {
    await TestType.destroy({
      where: { id_tipo: req.params.testTypeId }
    });
    res.json({ id: req.params.testTypeId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete TestType" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterTestType(filter)  {
    console.log("TestType Filter --->"+filter.replace("id","id_tipo"));

    const filters = JSON.parse(filter.replace("id","id_tipo"));

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
