const Script = require('../models/Script.js');

// Create and Save a new Script
exports.create = async (req, res) => {
  console.log('***** Create Scripts ******');
  try {
    const record = await Script.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Scripts not created' });
  }
};

// Retrieve and return all Scripts from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Scripts **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterScript(filter) : {};
    const { count, rows } = await Script.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_script', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_script }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_script })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Scripts" });
  }
};

// Find a single Script with a ScriptId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Script ********');
    const record = await Script.findByPk(req.params.scriptId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Script" });
  }
};

// Update a Script identified by the ScriptId in the request
exports.update = async (req, res) => {
  console.log('****** Update Scripts *****');

  try {
    const record = await Script.findByPk(req.params.scriptId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Script not found' });
    }
    const data = req.body;
    await Script.update(data, { where: { id_script: req.params.scriptId } });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update Script" });
  }
};

// Delete a Script with the specified ScriptId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Script*******');
  try {
    await Script.destroy({ where: { id_script: req.params.scriptId } });
    res.json({ id: req.params.scriptId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete Script" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterScript(filter)  {
    console.log("Script Filter --->"+filter.replace("id","id_script"));

    const filters = JSON.parse(filter.replace("id","id_script"));

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
