const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const cypress = require('cypress');
const rm = require('rimraf');
//const vrt = require('./manejador-vrt.js');

var configVrt = [
  { "before": "before1.png", "after": "after1.png", "result": "result1.png" },
  { "before": "before2.png", "after": "after2.png", "result": "result2.png" },
  { "before": "before3.png", "after": "after3.png", "result": "result3.png" }
]

//initializations
const app = express();

//settings
app.set('port', process.env.PORT || 8080);
AWS.config.update({ region: 'us-east-1' });
const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/e2e.fifo';
const params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: ['All'],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0
};

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
const sequelize = require('./database/database');
const Execution = require('./models/ejecucion');
const Result = require('./models/resultado');

//Initialize cron
const task = cron.schedule('*/10 * * * * *', () => {
  console.log('***** Initializing Cron *****');
  const sqs = new AWS.SQS();
  //Delete message from queue
  const deleteMessage = deleteParams => {
    sqs.deleteMessage(deleteParams, (err, data) => {
      if (err) {
        console.log('Delete Error', err);
      } else {
        console.log('Message Deleted', data);
      }
    });
  };
  //Recieve message from queue
  sqs.receiveMessage(params, async (err, data) => {
    if (err) {
      console.log('Receive Error', err);
    } else if (data.Messages) {
      const message = JSON.parse(data.Messages[0].Body);
      console.log(message);
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      deleteMessage(deleteParams);
      const strategyTest = await getStrategyTest(
        message.id_ejecucion,
        message.id_prueba,
        message.id_app,
        message.id_estrategia
      );

      var pathScreenRemove="./cypress/screenshots/*.*";     
      removeFiles(pathScreenRemove);
      const estado = strategyTest[0].estado;
      
      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        
        message.navegadores.forEach( async (record) => {
          
          if (estado === 'registrado') {
            await updateExecution(message.id_ejecucion, 'pendiente');
            let headless, headful;
            if (strategyTest[0].modo_prueba === 'headless') {
              headless = true;
              headful=false;
            } else {
              headless = false;
              headful=true;
            }
            
            let navegador = record.tipo;

            const versionApp = await getidapp(
              message.id_app,
              message.ruta_app
            );

            await executeWeb(
              message.ruta_script,
              headless,
              headful,
              navegador,
              message.vrt,
              message.ruta_app,
              versionApp[0].id_version,
              message.id_estrategia,
              message.id_prueba,
              message.id_ejecucion
            );

            if (message.vrt){
              const versionVrt= await getidapp(
                message.id_app,
                message.ruta_app_vrt
              );
              await executeWeb(
                message.ruta_script,
                headless,
                headful,
                navegador,
                message.vrt,
                message.ruta_app_vrt,
                versionVrt[0].id_version,
                message.id_estrategia,
                message.id_prueba,
                message.id_ejecucion
              );
            }
          }

        })
        
      }
      var pathScirptRemove="./cypress/integration/" + message.id_ejecucion + "*.spec.js";
      removeFiles(pathScirptRemove);  
    }
  });
});

//Find strategyTest given strategyId and testId
async function getStrategyTest(executionId, testId, appId, strategyId) {
  try {
    const record = await sequelize.query(
      'select e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
      {
        bind: {
          executionId: executionId,
          testId: testId,
          appId: appId,
          strategyId: strategyId
        },
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

//Find idApp
async function getidapp(appId, ruta) {
  try {
    const record = await sequelize.query(
      'select v.id_version from version v where v.id_app=$appId and v.ruta_app= $ruta',
      {
        bind: {
          appId: appId,
          ruta: ruta
        },
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

//Update execution given executionId
async function updateExecution(executionId, estado) {
  let fecha_fin = null;
  if (estado === 'ejecutado') {
    fecha_fin = new Date();
  }
  await Execution.update(
    { estado, fecha_fin },
    {
      where: {
        id_ejecucion: executionId,
      },
    }
  );
}

//execute random script with cypress
async function executeWeb(rutaScript, headless, headful, navegador, vrt, rutaApp, versionApp, strategyId, testId, executionId) {
  console.log('***** Executing Web ****');
  const s3 = new AWS.S3();
  const split = rutaScript.split('.com/');
  const bucket = 'miso-4208-grupo3';
  const prefix = split[1];
  const paramsL = {
    Bucket: bucket,
    Prefix: prefix
  };

  s3.listObjects(paramsL, (err, data) => {
    
    if (err) {
      throw err;
    }
    data.Contents.forEach(d => {
      const paramsG = {
        Bucket: bucket,
        Key: d.Key
      };
      s3.getObject(paramsG, async (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        // fs.mkdirSync(path.join(__dirname, '/cypress/integration'), {
        //   recursive: true
        // });
        var archivo = d.Key.split('/');
        
        if (archivo[2] != ''){
          fs.writeFileSync(          
            path.join(__dirname, '/cypress/integration', executionId+''+versionApp+navegador+archivo[2]),
            data.Body.toString()
          );
          console.log(executionId+''+versionApp+navegador+archivo[2] + ' has been created!');
          
          await cypress.run({
            headless: headless,
            headed:headful,
            browser:navegador,
            spec: path.join(__dirname, '/cypress/integration', executionId+''+versionApp+navegador+archivo[2]),
            chromeWebSecurity: false,
            config: {
              baseUrl: rutaApp
            },
            reporter: 'mochawesome',
            reporterOptions: {
              reportFilename: executionId+''+versionApp+navegador+archivo[2],
              reportDir: path.join(__dirname, '/cypress/results'),
              //overwrite: false,
              html: false,
              json: true,
              quiet: true
            }
          });

          let nameScript = d.Key.split('/');
          nameScript = nameScript[nameScript.length - 1];
          
          const video = fs.readFileSync(
            path.join(__dirname, '/cypress/videos', executionId+''+versionApp+navegador+archivo[2] + '.mp4')
          );
          
          const report = fs.readFileSync(
            path.join(__dirname, '/cypress/results', executionId+''+versionApp+navegador+archivo[2].split('.js')[0] + '.json')
          );

          const screenshot = fs.readFileSync(
            path.join(__dirname, '/cypress/screenshots/', executionId+''+versionApp+navegador+archivo[2])
          );
          //Uploading video to the bucket
          let paramsU = {
            Bucket:
              'miso-4208-grupo3/results/' +
              strategyId +
              '/' +
              testId +
              '/' +
              executionId,
            Key: executionId+''+versionApp+navegador + nameScript + '.mp4',
            Body: video
          };
          s3.upload(paramsU, async (err, data) => {
            if (err) {
              return err;
            }
            console.log('File uploaded successfully ' + data.Location);
            fs.unlinkSync(path.join(__dirname, '/cypress/videos', executionId+''+versionApp+navegador+archivo[2] + '.mp4'));

            await updateExecution(executionId, 'ejecutado');
            
          });
          paramsU.Key = executionId+''+versionApp+navegador + nameScript.split('.js')[0] + '.json';
          paramsU.Body = report;
          //Uploading json to the bucket
          s3.upload(paramsU, async (err, data) => {
            if (err) {
              return err;
            }
            console.log('File uploaded successfully ' + data.Location);
            fs.unlinkSync(path.join(
              __dirname,
              '/cypress/results',
              executionId+''+versionApp+navegador + archivo[2].split('.js')[0] + '.json'
            ));
            
          });

          
          await persist({
            id_ejecucion: executionId,
            ruta_archivo: path.dirname(data.Location),
            fecha: new Date()
          });
        }
      });
    });
  });
}

//persist results
async function persist(fields) {
  await Result.create(fields, { raw: true });
}

function removeFiles(pathFiles){

  rm(pathFiles, (error) => {
    if (error) {
    console.error(`Error while removing existing files: ${error}`)
    process.exit(1)
    }
    console.log('Removing all existing files successfully!')
  })
}
//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
