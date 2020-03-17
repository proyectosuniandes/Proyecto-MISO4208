const AppType = require('../models/TipoApp.js');

// Create and Save a new AppType
exports.create = async (req, res) => {
  console.log('***** Create AppTypes ******');
  try {
    const record = await AppType.create(req.body, {
      raw: true
    });
    res.status(201).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'AppTypes not created' });
  }
};

// Retrieve and return all AppTypes from the database.
exports.findAll = async (req, res) => {
  console.log('**** FindAll AppTypes **** ');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    const parsedFilter = filter ? parseFilterAppType(filter) : {};
    const { count, rows } = await AppType.findAndCountAll({
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_tipo_app', 'ASC']],
      where: parsedFilter,
      raw: true
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map(resource => ({ ...resource, id: resource.id_tipo_app }))
    );
    res.json(rows.map(resource => ({ ...resource, id: resource.id_tipo_app })));
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve AppTypes" });
  }
};

// Find a single AppType with a AppTypeId
exports.findOne = async (req, res) => {
  console.log(req.params);
  try {
    console.log('****** FindOne AppType ********');
    const record = await AppType.findByPk(req.params.appTypeId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't retrieve AppType" });
  }
};

// Update a AppType identified by the AppTypeId in the request
exports.update = async (req, res) => {
  console.log('****** Update AppTypes *****');

  try {
    const record = await AppType.findByPk(req.params.appTypeId, {
      raw: true
    });
    if (!record) {
      return res.status(404).json({ error: 'AppType not found' });
    }
    const data = req.body;
    await AppType.update(data, {
      where: { id_tipo_app: req.params.appTypeId }
    });
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't update AppType" });
  }
};

// Delete a AppType with the specified AppTypeId in the request
exports.delete = async (req, res) => {
  console.log('***** Delete AppType*******');
  try {
    await AppType.destroy({ where: { id_tipo_app: req.params.appTypeId } });
    res.json({ id: req.params.appTypeId });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "couldn't delete AppType" });
  }
};

/*export const parseFilter = (filter) => {
    const filters = JSON.parse(filter)

function parseFilterAppType(filter)  {
    console.log("AppType Filter --->"+filter.replace("id","id_tipo_app"));

    const filters = JSON.parse(filter.replace("id","id_tipo_app"));

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
