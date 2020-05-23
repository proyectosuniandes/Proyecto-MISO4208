const Version = require('../models/version');

//Update execution given executionId
const versions = async (ruta_version) => {
  const record = await Version.findOne(
  {
  	where: {
  		ruta_app: ruta_version,
  	},
  	raw: true
  });
  if (!record) {
  	return null;
  }
  return record.id_version;
};

module.exports = versions;