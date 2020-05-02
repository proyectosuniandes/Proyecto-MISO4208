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
app.set('port', process.env.PORT || 8090);
AWS.config.update({ region: 'us-east-2' });

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
const sequelize = require('./database/database');
const Estrategia = require('./models/estrategia');

//Bases
var base_reporte;
var base_ejecucion;
var base_imagen;
var base_video;
var base_json;
var base_html;
var base_txt;

//Temp Variables
var html_reporte;
var html_ejecucion;
var html_imagen;
var html_video;
var html_json;
var html_html;
var html_txt;

//Initialize cron
const task = cron.schedule('* * * * *', () => {
  console.log('***** Initializing Cron *****');
  ejecutarProceso();
});

async function ejecutarProceso() {
  loadBases();

  var lst_pendiente = await obtenerPendientes();

  var lst_result = [];
  lst_pendiente.forEach(function (entry) {
    var lst_estrategia = lst_result.find(x => x.id_estrategia == entry.id_estrategia);
    if (!lst_estrategia) {
      var lst_ejecucion = [];
      lst_ejecucion.push({
        id_ejecucion: entry.id_ejecucion
      });
      var lst_prueba = [];
      lst_prueba.push({
        id_prueba: entry.id_prueba,
        tipo_prueba: entry.tipo_prueba,
        lst_ejecucion: lst_ejecucion
      });
      lst_result.push({
        id_estrategia: entry.id_estrategia,
        lst_prueba: lst_prueba
      });
    } else {
      var lst_prueba = lst_estrategia.lst_prueba.find(x => x.id_prueba == entry.id_prueba);
      if (!lst_prueba) {
        var lst_ejecucion = [];
        lst_ejecucion.push({
          id_ejecucion: entry.id_ejecucion
        });
        lst_estrategia.lst_prueba.push({
          id_prueba: entry.id_prueba,
          tipo_prueba: entry.tipo_prueba,
          lst_ejecucion: lst_ejecucion
        });
      }
      else {
        var lst_ejecucion = lst_prueba.lst_ejecucion.find(x => x.id_ejecucion == entry.id_ejecucion);
        if (!lst_ejecucion) {
          lst_prueba.lst_ejecucion.push({
            id_ejecucion: entry.id_ejecucion
          });
        }
      }
    }
  });

  //console.log(lst_result[0].lst_prueba[0].lst_ejecucion)

  for (let es = 0; es < lst_result.length; es++) {
    var obj_estrategia = lst_result[es];
    var tmp_reporte = base_reporte;
    for (let pr = 0; pr < obj_estrategia.lst_prueba.length; pr++) {
      var obj_prueba = obj_estrategia.lst_prueba[pr];
      var tmp_ejecucion = '';
      for (let ej = 0; ej < obj_prueba.lst_ejecucion.length; ej++) {
        var obj_ejecucion = obj_prueba.lst_ejecucion[ej];

        await buildHtml(obj_estrategia.id_estrategia, obj_prueba.id_prueba, obj_ejecucion.id_ejecucion);

        var show_imagen = !html_imagen ? 'd-none' : '';
        var show_video = !html_video ? 'd-none' : '';
        var show_json = !html_json ? 'd-none' : '';
        var show_html = !html_html ? 'd-none' : '';
        var show_txt = !html_txt ? 'd-none' : '';

        tmp_ejecucion += base_ejecucion;
        tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_IMAGEN]', html_imagen);
        tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_VIDEO]', html_video);
        tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_JSON]', html_json);
        tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_HTML]', html_html);
        tmp_ejecucion = tmp_ejecucion.replace('[CONTENT_TXT]', html_txt);
        tmp_ejecucion = tmp_ejecucion.replace('[SHOW_IMAGEN]', show_imagen);
        tmp_ejecucion = tmp_ejecucion.replace('[SHOW_VIDEO]', show_video);
        tmp_ejecucion = tmp_ejecucion.replace('[SHOW_JSON]', show_json);
        tmp_ejecucion = tmp_ejecucion.replace('[SHOW_HTML]', show_html);
        tmp_ejecucion = tmp_ejecucion.replace('[SHOW_TXT]', show_txt);
        tmp_ejecucion = tmp_ejecucion.replace('[ID_EJECUCION]', obj_ejecucion.id_ejecucion);
      }

      var content_prueba = '';
      if (obj_prueba.tipo_prueba.toLowerCase() == 'random') content_prueba = '[CONTENT_RANDOM]';
      if (obj_prueba.tipo_prueba.toLowerCase() == 'e2e') content_prueba = '[CONTENT_E2E]';
      if (obj_prueba.tipo_prueba.toLowerCase() == 'bdt') content_prueba = '[CONTENT_BDT]';

      tmp_reporte = tmp_reporte.replace(content_prueba, tmp_ejecucion);
    }

    var sin_ejecucion = 'No hay ejecuciones para este tipo de prueba.';
    tmp_reporte = tmp_reporte.replace('[CONTENT_RANDOM]', sin_ejecucion);
    tmp_reporte = tmp_reporte.replace('[CONTENT_E2E]', sin_ejecucion);
    tmp_reporte = tmp_reporte.replace('[CONTENT_BDT]', sin_ejecucion);

    fs.writeFile(path.resolve(__dirname, `../tmp/report_${obj_estrategia.id_estrategia}.html`), tmp_reporte, function (err) {
      if (err) return console.log(err);
      console.log('Report has been created!');
    });
    uploadReport(obj_estrategia.id_estrategia, tmp_reporte);
    updateEstrategia(obj_estrategia.id_estrategia, 'ejecutado');
  }
}

async function buildHtml(pIdEstrategia, pIdPrueba, pIdEjecucion) {
  return new Promise((resolve, reject) => {

    html_reporte = '';
    html_ejecucion = '';
    html_imagen = '';
    html_video = '';
    html_json = '';
    html_html = '';
    html_txt = '';

    const s3 = new AWS.S3();
    const params = {
      Bucket: 'miso-4208-grupo3',
      Prefix: `results/${pIdEstrategia}/${pIdPrueba}/${pIdEjecucion}`
    };
    s3.listObjectsV2(params, function (err, data) {
      if (err) console.log(err, err.stack);
      //console.log(data);
      data.Contents.forEach(file => {
        const url = s3.getSignedUrl('getObject', {
          Bucket: data.Name,
          Key: file.Key,
          Expires: 604800
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
        if (ext === '.txt') {
          var text = request('GET', url);
          var object = base_txt.replace('[URL_TXT]', text.getBody('utf8'));
          html_txt += object;
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

async function compareResemble(first_file, second_file) {
  var diff = resemble(first_file).compareTo(second_file).ignoreColors().onComplete(function (data) {
    console.log(data);
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

async function obtenerPendientes() {
  try {
    const record = await sequelize.query(
      "SELECT es.id_estrategia, p.id_prueba, ej.id_ejecucion, p.tipo_prueba FROM estrategia_prueba ep INNER JOIN estrategia es ON es.id_estrategia = ep.id_estrategia AND es.estado = 'pendiente' INNER JOIN prueba p ON p.id_prueba = ep.id_prueba INNER JOIN ejecucion ej ON ej.id_estrategia = ep.id_estrategia AND ej.id_prueba = ep.id_prueba WHERE (SELECT COUNT(1) FROM ejecucion ej1 WHERE ej1.id_estrategia = es.id_estrategia AND ej1.id_prueba = p.id_prueba) = (SELECT COUNT(1) FROM ejecucion ej2 WHERE ej2.id_estrategia = es.id_estrategia AND ej2.id_prueba = p.id_prueba and ej2.estado = 'ejecutado');",
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

async function uploadReport(id_estrategia, report) {
  const s3 = new AWS.S3();
  s3.upload(
    {
      Bucket: `miso-4208-grupo3/consolidado/${id_estrategia}`,
      Key: 'report.html',
      Body: report,
      ContentType: "text/html"
    },
    async (err, data) => {
      if (err) console.log(err, err.stack);
      console.log('File uploaded successfully ' + data.Location);
      updateRutaConsolidado(id_estrategia, data.Location)
    });
}

async function updateRutaConsolidado(id_estrategia, ruta_consolidado) {
  await Estrategia.update(
    { ruta_consolidado: ruta_consolidado },
    {
      where: {
        id_estrategia: id_estrategia
      }
    }
  );
}

async function updateEstrategia(id_estrategia, estado) {
  await Estrategia.update(
    { estado: estado },
    {
      where: {
        id_estrategia: id_estrategia
      }
    }
  );
}

function loadBases() {
  base_reporte = fs.readFileSync(path.resolve(__dirname, '../templates/base_reporte.html')).toString('utf8');
  base_ejecucion = fs.readFileSync(path.resolve(__dirname, '../templates/base_ejecucion.html')).toString('utf8');
  base_imagen = fs.readFileSync(path.resolve(__dirname, '../templates/base_imagen.html')).toString('utf8');
  base_video = fs.readFileSync(path.resolve(__dirname, '../templates/base_video.html')).toString('utf8');
  base_json = fs.readFileSync(path.resolve(__dirname, '../templates/base_json.html')).toString('utf8');
  base_html = fs.readFileSync(path.resolve(__dirname, '../templates/base_html.html')).toString('utf8');
  base_txt = fs.readFileSync(path.resolve(__dirname, '../templates/base_txt.html')).toString('utf8');
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
