const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

//Initializations
const app = express();

//Settings
app.set('port', process.env.PORT || 8080);
AWS.config.update({ region: 'us-east-2' });

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
const sequelize = require('./database/database');
const Execution = require('./models/ejecucion');
const Result = require('./models/resultado');

//Initialize cron
const task = cron.schedule('* * * * *', () => {
  console.log('***** Initializing Cron *****');
  ejecutarProceso();
});

async function ejecutarProceso() {
  var result = await obtenerEjecutados();
  console.log(result);
  result.forEach(async item => {
    if (item.tipo_prueba === 'random' && item.tipo_app === 'movil') {
      await downloadFiles(item.id_ejecucion);
      var template = fs.readFileSync(path.resolve(__dirname, '../templates/template-adb.html')).toString('utf8');
      var content = fs.readFileSync(path.resolve(__dirname, '../tmp/report.txt')).toString('utf8');
      var report = template.replace('[CONTENT]', content);
      await uploadReport(item.id_ejecucion, report);
      deleteTempFiles();
    }
  });
}

async function deleteTempFiles() {
  var folder = path.resolve(__dirname, '../tmp/');
  fs.readdir(folder, (err, files) => {
    files.forEach(item => {
      fs.unlinkSync(path.resolve(folder, item));
    });
    console.log('Temporary files has been deleted!');
  });
}

async function obtenerEjecutados() {
  try {
    const record = await sequelize.query(
      "select e.id_ejecucion, e.id_estrategia, e.id_prueba, e.estado, e.id_prueba, p.tipo_prueba, a.tipo_app from ejecucion e inner join prueba p on e.id_prueba = p.id_prueba inner join app a on p.id_app = a.id_app  where estado = 'ejecutado' AND e.id_ejecucion = 4",
      {
        type: QueryTypes.SELECT,
        raw: true
      }
    );
    if (!record) {
      return null;
    }
    return record;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function downloadFiles(idEjecucion) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    const LOparams = {
      Bucket: 'miso-4208-grupo3',
      Prefix: 'results/' + idEjecucion + '/'
    };

    s3.listObjectsV2(LOparams, function (LOerr, LOdata) {
      if (LOerr) console.log(LOerr, LOerr.stack);

      console.log(LOdata);
      var length = LOdata.Contents.length;
      LOdata.Contents.forEach(file => {
        var GOparams = {
          Bucket: LOparams.Bucket,
          Key: file.Key
        };
        s3.getObject(GOparams, function (GOerr, GOdata) {
          if (GOerr) console.log(GOerr, GOerr.stack);

          var filename = path.basename(file.Key);
          var ext = path.extname(file.Key);
          if (ext) {
            fs.writeFileSync(path.join(__dirname, '../tmp/', filename), GOdata.Body.toString());
            console.log(filename + ' has been created!');

            length--;
            if (length === 1) {
              resolve('OK');
            }
          }
        });
      });
    });
  });
}

async function uploadReport(idEjecucion, report) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    s3.upload(
      {
        Bucket: 'miso-4208-grupo3/results/' + idEjecucion,
        Key: 'report.html',
        Body: report
      },
      async (err, data) => {
        if (err) console.log(err, err.stack);

        console.log('File uploaded successfully ' + data.Location);
        await persist({ id_ejecucion: idEjecucion, ruta_archivo: data.Location });
        resolve('OK');
      });
  });
}

//Update execution given executionId
async function updateExecution(executionId, estado) {
  await Execution.update(
    { estado: estado },
    {
      where: {
        id_ejecucion: executionId
      }
    }
  );
}

//Persist results
async function persist(fields) {
  await Result.create(fields, { raw: true });
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
