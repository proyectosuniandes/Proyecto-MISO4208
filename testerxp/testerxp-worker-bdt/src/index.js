const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
let shell = require('shelljs');

//Initializations
const app = express();

//Settings
app.set('port', process.env.PORT || 8080);
AWS.config.update({ region: 'us-east-1' });
const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/bdt.fifo';
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
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };

      const strategyTest = await getStrategyTest(
        message.id_ejecucion,
        message.id_prueba,
        message.id_app
      );
      //deleteMessage(deleteParams);
      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        console.log(strategyTest);
        if (strategyTest.estado === 'registrado') {
          await updateExecution(message.id_ejecucion, 'pendiente');
          if (strategyTest.tipo_app === 'web') {
            await executeWeb(
              message.ruta_script,
              strategyTest
            );
          }
        }
      }
    }
  });
});

//Find strategyTest given strategyId and testId
async function getStrategyTest(executionId, testId, appId) {
  try {
    const record = await sequelize.query(
      'select e.id_ejecucion, p.id_prueba, e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
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

//execute test
async function executeWeb(rutaScript, strategyTest) {
  await downloadFiles(strategyTest.id_prueba);
  await runCucumber(strategyTest);
  await uploadReport(strategyTest.id_ejecucion)
}

async function downloadFiles(idPrueba) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    const LOparams = {
      Bucket: 'miso-4208-grupo3',
      Prefix: 'script/' + idPrueba + '/'
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
            var target = ext === '.js' ? 'step-definitions' : ext === '.feature' ? 'features' : '';
            fs.writeFileSync(
              path.join(__dirname, '../' + target, filename),
              GOdata.Body.toString()
            );
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

async function runCucumber(strategyTest) {
  return new Promise((resolve, reject) => {
    console.log('Running Cucumber...');
    var pathTest = strategyTest.modo_prueba === 'headless' ? 'node ./node_modules/selenium-cucumber-js/index.js -k none'
      : strategyTest.modo_prueba === 'headful' ? 'node ./node_modules/selenium-cucumber-js/index.js' : '';
    console.log(strategyTest.modo_prueba + ': ' + pathTest);

    if (shell.exec(pathTest).code !== 0) {
      shell.exit(1);
      console.log('Cucumber failed. ' + err);
    }
    else {
      console.log('Cucumber complete. ');
      updateExecution(strategyTest.id_ejecucion, 'ejecutado');
      resolve('OK');
    }
  });
}

async function uploadReport(idEjecucion) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3();
    const report = fs.readFileSync(
      path.join(__dirname, '../reports/cucumber-report.html')
    );
    s3.upload(
      {
        Bucket: 'miso-4208-grupo3/results/bdt',
        Key: 'cucumber-report.html',
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

//Persist results
async function persist(fields) {
  await Result.create(fields, { raw: true });
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
