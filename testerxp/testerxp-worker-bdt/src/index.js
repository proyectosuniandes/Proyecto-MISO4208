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
      deleteMessage(deleteParams);
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
      'select e.id_ejecucion, e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//execute test
async function executeWeb(rutaScript, strategyTest) {
  const script = path.posix.basename(rutaScript);

  downloadFile(script, '.js', 'step-definitions');
  downloadFile(script, '.feature', 'features');
  console.log('Scripts "' + script + '" downloaded!');

  await sleep(2000);
  console.log('Running Cucumber...');
  let pathTest;
  if (strategyTest.modo_prueba === 'headless')
  {
    pathTest = 'node ./node_modules/selenium-cucumber-js/index.js -k none';
  }
  if (strategyTest.modo_prueba === 'headful')
  {
    pathTest = 'node ./node_modules/selenium-cucumber-js/index.js';
  }
  if (shell.exec(pathTest).code !== 0) {
    shell.exit(1);
    console.log('Cucumber failed. ' + err);
  }
  else {
    console.log('Cucumber complete. ');
    await updateExecution(strategyTest.id_ejecucion, 'ejecutado');
  }

  //Uploading report to the bucket
  const s3 = new AWS.S3();
  const report = fs.readFileSync(
    path.join(__dirname, '../reports/cucumber-report.html')
  );
  s3.upload(
    {
      Bucket: 'miso-4208-grupo3/results/bdt',
      Key: script + '.html',
      Body: report
    },
    async (err, data) => {
      if (err) {
        return err;
      }
      console.log('File uploaded successfully ' + data.Location);
      await persist({ id_ejecucion: strategyTest.id_ejecucion, ruta_archivo: data.Location });
    }
  );
}

async function downloadFile(script, ext, target) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: 'miso-4208-grupo3/script/bdt',
    Key: script + ext
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync(
      path.join(__dirname, '../' + target, script + ext),
      data.Body.toString()
    );
    console.log(script + ext + ' has been created!');
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
