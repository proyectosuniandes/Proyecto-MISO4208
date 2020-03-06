const Result = require('../models/Resultado.js');
const HistoricalTest = require('../models/HistoricoPrueba.js');

// Create and Save a new Result
exports.create = async (req, res) => {
  console.log('***** Create Results ******');
  try {
    const record = await Result.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Results not created' });
  }
};

// Retrieve and return all Results from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Results **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterResult(filter) : {};
    const { count, rows } = await Result.findAndCountAll({
      include: HistoricalTest,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_resultado', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_resultado }))
    );
    res.json(
      rows.map(resource => ({ ...resource, id: resource.id_resultado }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Results" });
  }
};

// Find a single Result with a ResultId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Result ********');
    const record = await Result.findByPk(req.params.resultId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Result" });
  }
};

// Update a Result identified by the ResultId in the request
exports.update = async (req, res) => {
  console.log('****** Update Results *****');

  try {
    const record = await Result.findByPk(req.params.resultId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Result not found' });
    }
    const data = req.body;
    await Result.update(data, {
      where: { id_resultado: req.params.resultId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update Result" });
  }
};

// Delete a Result with the specified ResultId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Result*******');
  try {
    await Result.destroy({
      where: { id_resultado: req.params.resultId }
    });
    res.json({ id: req.params.resultId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete Result" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterResult(filter)  {
    console.log("Result Filter --->"+filter.replace("id","id_resultado"));

    const filters = JSON.parse(filter.replace("id","id_resultado"));

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
