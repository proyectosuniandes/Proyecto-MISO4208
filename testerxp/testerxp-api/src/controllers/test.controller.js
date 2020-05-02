const Test = require('../models/prueba');

//Create and Save a new Test
exports.create = async (req) => {
  console.log('***** Create Test *****');
  try {
    const record = await Test.create(req, {
      raw: true,
    });
    return record;
  } catch (e) {
    console.log(e);
    return null;
  }
};

//Retrieve a Test identified by the appId in the request

exports.findOne = async (req, res) => {
  console.log('***** FindOne Test *****');
  try {
    const record = await Test.findByPk(req.params.testId, {
      raw: true,
    });
    if (!record) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.status(200).json(record);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error retrieving Test' });
  }
};
