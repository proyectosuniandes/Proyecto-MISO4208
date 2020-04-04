const Script = require('../models/script');
const AWS = require('aws-sdk');
const path = require('path');

//Create and Save a new Script
exports.create = async (idPrueba, files, fileName) => {
  console.log('***** Create Script *****');
  try {
    uploadFile(files, fileName, idPrueba, async (fields) => {
      await Script.create(fields, {
        raw: true,
      });
    });
  } catch (e) {
    console.log(e);
  }
};

async function uploadFile(scripts, scriptsName, idPrueba, persist) {
  if (typeof scripts === 'string') {
    scripts = [scripts];
  }
  if (typeof scriptsName === 'string') {
    scriptsName = [scriptsName];
  }
  const s3 = new AWS.S3();
  //Setting up S3 upload parameters
  let params = {
    Bucket: 'miso-4208-grupo3/script/' + idPrueba,
  };
  //Read content from file
  for (let i = 0; i < scripts.length; i++) {
    //Updating S3 upload parameters
    params.Key = scriptsName[i];
    const file = new Buffer(scripts[i], 'base64');
    params.Body = file;
    //Uploading files to the bucket
    await s3.upload(params, async (err, data) => {
      if (err) {
        return err;
      }
      console.log('File uploaded successfully ' + data.Location);
      if (i === scripts.length - 1) {
        const fields = {
          id_prueba: idPrueba,
          ruta_script: path.dirname(data.Location),
        };
        persist(fields);
      }
    });
  }
}
