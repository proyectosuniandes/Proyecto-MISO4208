const Script = require('../models/script');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//Create and Save a new Script
exports.create = async (idPrueba, files) => {
  console.log('***** Create Script *****');
  try {
    uploadFile(files, idPrueba, async (fields) => {
      await Script.create(fields, {
        raw: true,
      });
    });
  } catch (e) {
    console.log(e);
  }
};

async function uploadFile(scripts, idPrueba, persist) {
  if (scripts[0] === undefined) {
    scripts = [scripts];
  }
  const s3 = new AWS.S3();
  //Setting up S3 upload parameters
  let params = {
    Bucket: 'miso-4208-grupo3/script/' + idPrueba,
  };
  //Read content from file
  for (let i = 0; i < scripts.length; i++) {
    const fileContent = fs.readFileSync(scripts[i].path);
    //Updating S3 upload parameters
    params.Key = scripts[i].name;
    params.Body = fileContent;
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
