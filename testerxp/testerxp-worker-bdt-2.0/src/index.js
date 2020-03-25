const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
let shell = require('shelljs');

//initializations
const app = express();

//settings
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
        message.estrategia_ID,
        message.prueba_ID,
        message.aplicacion_ID
      );
      deleteMessage(deleteParams);
      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        console.log(strategyTest);
        if (strategyTest.estado === 'registrado') {
          await updateExecution(strategyTest.id_ejecucion, 'pendiente');
          let headless;
          if (strategyTest.modo_prueba === 'headless') {
            headless = true;
          } else {
            headless = false;
          }
          if (strategyTest.tipo_app === 'web') {
            await executeWeb(
              message.script,
              headless,
              strategyTest.id_ejecucion
            );
          } else {

          }
        }
      }
    }
  });
});

//Find strategyTest given strategyId and testId
async function getStrategyTest(strategyId, testId, appId) {
  try {
    const record = await sequelize.query(
      'select ep.id_ejecucion, e.estado, a.tipo_app, p.modo_prueba from estrategia_prueba ep, ejecucion e, app a, prueba p where ep.id_estrategia = $strategyId and ep.id_prueba = $testId and ep.id_ejecucion =e.id_ejecucion and a.id_app = $appId',
      {
        bind: {
          strategyId: strategyId,
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
async function executeWeb(rutaScript, mode, executionId) {
  const s3 = new AWS.S3();
  const script = path.posix.basename(rutaScript);

  console.log(script + ' route!');

  const params = {
    Bucket: 'miso-4208-grupo3/script/bdt',
    Key: script + ".js"
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync(
      path.join(__dirname, '../step-definitions', script),
      data.Body.toString()
    );
    console.log(script + ' has been created!');
  });
  /*await cypress.run({
    headless: mode,
    spec: path.join(__dirname, '../cypress/integration', script),
    chromeWebSecurity: false,
    reporter: 'mochawesome',
    reporterOptions: {
      reportFilename: script,
      reportDir: path.join(__dirname, '../cypress/results'),
      overwrite: false,
      html: false,
      json: true,
      quiet: true
    }
  });
  const video = fs.readFileSync(
    path.join(__dirname, '../cypress/videos', script + '.mp4')
  );
  const report = fs.readFileSync(
    path.join(__dirname, '../cypress/results', script.split('.')[0] + '.json')
  );
  //Uploading video to the bucket
  s3.upload(
    {
      Bucket: 'miso-4208-grupo3/results',
      Key: script + '.mp4',
      Body: video
    },
    async (err, data) => {
      if (err) {
        return err;
      }
      console.log('File uploaded successfully ' + data.Location);
      await persist({ id_ejecucion: executionId, ruta_archivo: data.Location });
      await updateExecution(executionId, 'ejecutado');
    }
  );
  //Uploading json to the bucket
  s3.upload(
    {
      Bucket: 'miso-4208-grupo3/results',
      Key: script + '.json',
      Body: report
    },
    async (err, data) => {
      if (err) {
        return err;
      }
      console.log('File uploaded successfully ' + data.Location);
      await persist({ id_ejecucion: executionId, ruta_archivo: data.Location });
    }
  );*/
}

//persist results
async function persist(fields) {
  await Result.create(fields, { raw: true });
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
