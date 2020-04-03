const StrategyTest = require('../models/estrategiaPrueba');
const Strategy = require('../models/estrategia');
const Test = require('../models/prueba');

// Retrieve all StrategyTests from the database.
exports.findAll = async (req, res) => {
  console.log('***** FindAll StrategyTests *****');
  try {
    const { range, sort, filter } = req.query;
    console.log(filter);
    const [from, to] = range ? JSON.parse(range) : [0, 100];
    //const parsedFilter = filter ? parseFilterVersion(filter) : {};
    const { count, rows } = await StrategyTest.findAndCountAll({
      include: [
        { model: Test, as: 'prueba' },
        { model: Strategy, as: 'estrategia' },
      ],
      offset: from,
      limit: to - from + 1,
      order: [sort ? JSON.parse(sort) : ['id_estrategia', 'ASC']],
      //where: parsedFilter,
      raw: true,
    });
    res.set('Content-Range', `${from}-${from + rows.length}/${count}`);
    res.set('X-Total-Count', `${count}`);

    console.log(
      rows.map((resource) => ({ ...resource, id: resource.id_estrategia }))
    );
    res.json(
      rows.map((resource) => ({ ...resource, id: resource.id_estrategia }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error retrieving StrategyTests' });
  }
};

//Retrieve a StrategyTest identified by the strategyId and the testId in the request
exports.findOne = async (req, res) => {
  console.log('***** FindOne StrategyTest *****');
  try {
    const record = await StrategyTest.findOne({
      where: {
        id_estrategia: req.params.strategyId,
        id_prueba: req.params.testId,
      },
      include: [
        { model: Test, as: 'prueba' },
        { model: Strategy, as: 'estrategia' },
      ],
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'StrategyTest not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving StrategyTest' });
  }
};

//Create and Save a new StrategyTest
exports.create = async (strategy, test) => {
  console.log('***** Create StrategyTest *****');
  try {
    await StrategyTest.create(
      { id_estrategia: strategy, id_prueba: test },
      {
        raw: true,
      }
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
