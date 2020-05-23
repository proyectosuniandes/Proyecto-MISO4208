const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3();
const bucket = 'miso-4208-grupo3';

const list = (prefix) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Prefix: prefix,
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.Contents);
    });
  });
};

const get = (key, app) => {
  return new Promise((resolve, reject) => {
    let params = {
      Bucket: bucket,
      Key: key,
    };
    if (app !== undefined) {
      params.Bucket = bucket + app;
    }
    s3.getObject(params, async (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(data.Body);
    });
  });
};

const uploadFiles = (filePath, bucketPath, filesPrefix) => {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, async (err, files) => {
      if (err) {
        resolve('no hay archivos');
      }
      if (!files.length) {
        resolve('no hay archivos');
      }
      for (let i=0; i< files.length; i++) {
        const f = files[i];
        if(f !== 'vrt' && f !== 'assets'){
          const file = fs.readFileSync(path.join(filePath, f));
          let paramsUpload;
          if(filesPrefix !== null){
            paramsUpload = {
              Bucket: bucket + bucketPath,
              Key: filesPrefix + '_' + f,
              Body: file
            };
          }
          else{
            paramsUpload = {
              Bucket: bucket + bucketPath,
              Key: f,
              Body: file
            };
          }
          if(f.split('.').pop()==='html'){
            paramsUpload.ContentType = 'text/html' 
            console.log('paramsUpload: ', paramsUpload);
          }
          s3.upload(paramsUpload, async (err, data) => {
            if (err) {
              reject(err);
            }
            console.log('File uploaded successfully ' + data.Location);
            fs.unlinkSync(path.join(filePath, f));
            if (files.length - 1 === i) {
              console.log('last Element');
              resolve(files);
            }
          });
        }
        else if (f === 'assets'){
          await uploadFiles(filePath+'/assets',bucketPath+'/assets',filesPrefix);
          if (files.length - 1 === i) {
            console.log('last Element');
            resolve(files);
          }
        }
        else {
          if (files.length - 1 === i) {
            console.log('last Element');
            resolve(files);
          }
        }
      }
    });
  });
};

module.exports = { list, get, uploadFiles };
