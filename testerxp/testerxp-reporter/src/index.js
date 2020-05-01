const express = require('express');
const cron = require('node-cron');
const request = require('sync-request');
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

//Bases
var base_reporte;
var base_ejecucion;
var base_imagen;
var base_video;
var base_json;
var base_html;

//Temp Variables
var html_reporte;
var html_ejecucion;
var html_imagen;
var html_video;
var html_json;
var html_html;

//Initialize cron
const task = cron.schedule('* * * * *', () => {
  console.log('***** Initializing Cron *****');
  ejecutarProceso();
});

async function ejecutarProceso() {
  loadBases();
  html_reporte = '';
  html_ejecucion = '';
  html_imagen = '';
  html_video = '';
  html_json = '';
  html_html = '';

  await buildHtml(1, 1, 1);

  var show_imagen = !html_imagen ? 'd-none' : '';
  var show_video = !html_video ? 'd-none' : '';
  var show_json = !html_json ? 'd-none' : '';
  var show_html = !html_html ? 'd-none' : '';

  var tmp_ejecucion = base_ejecucion;
  tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_IMAGEN]', html_imagen);
  tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_VIDEO]', html_video);
  tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_JSON]', html_json);
  tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_HTML]', html_html);
  tmp_ejecucion = tmp_ejecucion.replace('[SHOW_IMAGEN]', show_imagen);
  tmp_ejecucion = tmp_ejecucion.replace('[SHOW_VIDEO]', show_video);
  tmp_ejecucion = tmp_ejecucion.replace('[SHOW_JSON]', show_json);
  tmp_ejecucion = tmp_ejecucion.replace('[SHOW_HTML]', show_html);
  var tmp_reporte = base_reporte.replace('[CONTENT]', tmp_ejecucion);

  fs.writeFile(path.resolve(__dirname, '../tmp/report.html'), tmp_reporte, function (err) {
    if (err) return console.log(err);
    console.log('Report has been created!');
  });
  /*var result = await obtenerEjecutados();
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
  });*/
}

async function buildHtml(pIdEstrategia, pIdPrueba, pIdEjecucion) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    const params = {
      Bucket: 'miso-4208-grupo3',
      Prefix: `results/${pIdEstrategia}/${pIdPrueba}/${pIdEjecucion}`
    };
    s3.listObjectsV2(params, function (err, data) {
      if (err) console.log(err, err.stack);
      console.log(data);
      data.Contents.forEach(file => {
        const url = s3.getSignedUrl('getObject', {
          Bucket: data.Name,
          Key: file.Key,
          Expires: 0
        });

        var ext = path.extname(file.Key).toLowerCase();
        if (ext === '.png') {
          var object = base_imagen.replace('[URL_IMAGEN]', url);
          html_imagen += object;
        }
        if (ext === '.mp4') {
          var object = base_video.replace('[URL_VIDEO]', url);
          html_video += object;
        }
        if (ext === '.json') {
          var text = request('GET', url);
          var object = base_json.replace('[URL_JSON]', text.getBody('utf8'));
          html_json += object;
        }
        if (ext === '.html') {
          var object = base_html.replace('[URL_HTML]', url);
          html_html += object;
        }
      });

      resolve('OK');
    });
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

function loadBases() {
  base_reporte = fs.readFileSync(path.resolve(__dirname, '../templates/base_reporte.html')).toString('utf8');
  base_ejecucion = fs.readFileSync(path.resolve(__dirname, '../templates/base_ejecucion.html')).toString('utf8');
  base_imagen = fs.readFileSync(path.resolve(__dirname, '../templates/base_imagen.html')).toString('utf8');
  base_video = fs.readFileSync(path.resolve(__dirname, '../templates/base_video.html')).toString('utf8');
  base_json = fs.readFileSync(path.resolve(__dirname, '../templates/base_json.html')).toString('utf8');
  base_html = fs.readFileSync(path.resolve(__dirname, '../templates/base_html.html')).toString('utf8');
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
