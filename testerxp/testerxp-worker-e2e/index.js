const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const cypress = require('cypress');
const rm = require('rimraf');

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
const task = cron.schedule('* * * * *', () => {
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
        message.id_app
      );

      var pathScirptRemove="./cypress/integration/*.spec.js";     
			// delete all existing report files
      removeFiles(pathScirptRemove);
      
      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        if (strategyTest.estado === 'registrado') {
          await updateExecution(message.id_ejecucion, 'pendiente');
          let headless, headful;
          if (strategyTest.modo_prueba === 'headless') {
            headless = true;
            headful=false;
          } else {
            headless = false;
            headful=true;
          }
          await executeWeb(
            message.ruta_script,
            headless,
            headful,
            message.id_estrategia,
            message.id_prueba,
            message.id_ejecucion
          );
        }
      }
    }
  });
});

//Find strategyTest given strategyId and testId
async function getStrategyTest(executionId, testId, appId) {
  try {
    const record = await sequelize.query(
      'select e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
      {
        bind: {
          executionId: executionId,
          testId: testId,
          appId: appId
        },
        type: QueryTypes.SELECT,
        raw: true
      }
    );
    if (!record) {
      return null;
    }
    return record[0];
  } catch (e) {
    console.log(e);
    return null;
  }
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

//execute random script with cypress
async function executeWeb(rutaScript, headless,headful, strategyId, testId, executionId) {
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
        fs.writeFileSync(          
          path.join(__dirname, '/cypress/integration', archivo[2]),
          data.Body.toString()
        );
        console.log(archivo[2] + ' has been created!');
        await cypress.run({
          headless: headless,
          headed:headful,
          spec: path.join(__dirname, '/cypress/integration', archivo[2]),
          chromeWebSecurity: false,
          reporter: 'mochawesome',
          reporterOptions: {
            reportFilename: archivo[2],
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
          path.join(__dirname, '/cypress/videos', archivo[2] + '.mp4')
        );
        console.log(archivo[2].split('.js'));
        const report = fs.readFileSync(
          path.join(__dirname, '/cypress/results', archivo[2].split('.js')[0] + '.json')
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
          Key: nameScript + '.mp4',
          Body: video
        };
        s3.upload(paramsU, async (err, data) => {
          if (err) {
            return err;
          }
          console.log('File uploaded successfully ' + data.Location);
          fs.unlinkSync(path.join(__dirname, '/cypress/videos', archivo[2] + '.mp4'));
          await persist({
            id_ejecucion: executionId,
            ruta_archivo: path.dirname(data.Location)
          });
          await updateExecution(executionId, 'ejecutado');
        });
        paramsU.Key = nameScript.split('.js')[0] + '.json';
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
            archivo[2].split('.js')[0] + '.json'
          ));
          await persist({
            id_ejecucion: executionId,
            ruta_archivo: path.dirname(data.Location)
          });
        });
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
