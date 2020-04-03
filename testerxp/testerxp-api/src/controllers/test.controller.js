const Test = require('../models/Prueba');

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
