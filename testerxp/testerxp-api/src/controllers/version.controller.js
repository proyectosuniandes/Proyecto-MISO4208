const Version = require('../models/Version.js');
const Application = require('../models/App.js');

// Create and Save a new Version
exports.create = async (req, res) => {
  console.log('***** Create Versions ******');
  try {
    const record = await Version.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Versions not created' });
  }
};

// Retrieve and return all Versions from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll Versions **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await Version.findAndCountAll({
      include: Application,
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_version', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_version }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_version })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Versions" });
  }
};

// Find a single Version with a VersionId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne Version ********');
    const record = await Version.findByPk(req.params.versionId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve Version" });
  }
};

// Update a Version identified by the VersionId in the request
exports.update = async (req, res) => {
  console.log('****** Update Versions *****');

  try {
    const record = await Version.findByPk(req.params.versionId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Version not found' });
    }
    const data = req.body;
    await Version.update(data, {
      where: { id_version: req.params.versionId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update Version" });
  }
};

// Delete a Version with the specified VersionId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete Version*******');
  try {
    await Version.destroy({
      where: { id_version: req.params.versionId }
    });
    res.json({ id: req.params.versionId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete Version" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterVersion(filter)  {
    console.log("Version Filter --->"+filter.replace("id","id_version"));

    const filters = JSON.parse(filter.replace("id","id_version"));

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
