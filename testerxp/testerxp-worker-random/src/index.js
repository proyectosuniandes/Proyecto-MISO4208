const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const { QueryTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const cypress = require('cypress');
const adb = require('adbkit');
let shell = require('shelljs');

//initializations
const app = express();
const client = adb.createClient();

//settings
app.set('port', process.env.PORT || 8080);
AWS.config.update({ region: 'us-east-1' });
const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/random.fifo';
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
      deleteMessage(deleteParams);
      const strategyTest = await getStrategyTest(
        message.id_ejecucion,
        message.id_prueba,
        message.id_app
      );
      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        if (strategyTest.estado === 'registrado') {
          await updateExecution(message.id_ejecucion, 'pendiente');
          let headless, headful;
          if (strategyTest.modo_prueba === 'headless') {
            headless = true;
            headful = false;
          } else {
            headless = false;
            headful = true;
          }
          if (strategyTest.tipo_app === 'web') {
            await executeWeb(
              message.ruta_script,
              headless,
              headful,
              message.id_estrategia,
              message.id_prueba,
              message.id_ejecucion
            );
          } else {
            await executeMovil(
              message.ruta_app,
              message.parametro,
              message.id_estrategia,
              message.id_prueba,
              message.id_ejecucion
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
async function executeWeb(
  rutaScript,
  headless,
  headful,
  strategyId,
  testId,
  executionId
) {
  console.log('***** Executing Web Random *****');
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
        fs.mkdirSync(path.join(__dirname, '../cypress/integration', prefix), {
          recursive: true
        });
        fs.writeFileSync(
          path.join(__dirname, '../cypress/integration', d.Key),
          data.Body.toString()
        );
        console.log(d.Key + ' has been created!');
        const a = await cypress.run({
          headless: headless,
          headed: headful,
          spec: path.join(__dirname, '../cypress/integration', d.Key),
          screenshotsFolder: path.join(
            __dirname,
            '../cypress/screenshots',
            prefix
          ),
          chromeWebSecurity: false,
          reporter: 'mochawesome',
          reporterOptions: {
            reportFilename: d.Key,
            reportDir: path.join(__dirname, '../cypress/results'),
            //overwrite: false,
            html: false,
            json: true,
            quiet: true
          }
        });
        let paramsU = {
          Bucket:
            'miso-4208-grupo3/results/' +
            strategyId +
            '/' +
            testId +
            '/' +
            executionId
        };
        let nameScript = d.Key.split('/');
        nameScript = nameScript[nameScript.length - 1];
        if (a.runs[0].screenshots.length > 0) {
          const screenshot = fs.readFileSync(a.runs[0].screenshots[0].path);
          paramsU.Key = nameScript + '.png';
          paramsU.Body = screenshot;
          s3.upload(paramsU, async (err, data) => {
            if (err) {
              return err;
            }
            console.log('File uploaded successfully ' + data.Location);
            fs.unlinkSync(a.runs[0].screenshots[0].path);
            await persist({
              id_ejecucion: executionId,
              ruta_archivo: data.Location
            });
            await updateExecution(executionId, 'ejecutado');
          });
        }
        fs.unlinkSync(path.join(__dirname, '../cypress/integration', d.Key));
        const video = fs.readFileSync(
          path.join(__dirname, '../cypress/videos', d.Key + '.mp4')
        );
        const report = fs.readFileSync(
          path.join(
            __dirname,
            '../cypress/results',
            d.Key.split('.')[0] + '.json'
          )
        );
        //Uploading video to the bucket
        paramsU.Key = nameScript + '.mp4';
        paramsU.Body = video;
        s3.upload(paramsU, async (err, data) => {
          if (err) {
            return err;
          }
          console.log('File uploaded successfully ' + data.Location);
          fs.unlinkSync(
            path.join(__dirname, '../cypress/videos', d.Key + '.mp4')
          );
          await persist({
            id_ejecucion: executionId,
            ruta_archivo: data.Location
          });
          await updateExecution(executionId, 'ejecutado');
        });
        paramsU.Key = nameScript.split('.')[0] + '.json';
        paramsU.Body = report;
        //Uploading json to the bucket
        s3.upload(paramsU, async (err, data) => {
          if (err) {
            return err;
          }
          console.log('File uploaded successfully ' + data.Location);
          fs.unlinkSync(
            path.join(
              __dirname,
              '../cypress/results',
              d.Key.split('.')[0] + '.json'
            )
          );
          await persist({
            id_ejecucion: executionId,
            ruta_archivo: data.Location
          });
        });
      });
    });
  });
}

//execute random test with adb
async function executeMovil(
  appRoute,
  parameter,
  strategyId,
  testId,
  executionId
) {
  console.log('***** Executing Movil Random *****');
  const s3 = new AWS.S3();
  const app = path.posix.basename(appRoute);
  const params = {
    Bucket: 'miso-4208-grupo3/app',
    Key: app
  };
  s3.getObject(params, async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync(path.join(__dirname, '../adb', app), data.Body);
    console.log(app + ' has been created!');
    const devices = await client.listDevices();
    await client.install(devices[0].id, path.join(__dirname, '../adb', app));
    shell.cd(process.env.SDK);
    shell.exec(parameter + ' > /home/ubuntu/adbResult' + app + '_log.txt');
    fs.unlinkSync(path.join(__dirname, '../adb', app));
    const log = fs.readFileSync('/home/ubuntu/adbResult' + app + '_log.txt');
    let paramsU = {
      Bucket:
        'miso-4208-grupo3/results/' +
        strategyId +
        '/' +
        testId +
        '/' +
        executionId,
      Key: app + '_log.txt',
      Body: log
    };
    s3.upload(paramsU, async (err, data) => {
      if (err) {
        return err;
      }
      console.log('File uploaded successfully ' + data.Location);
      fs.unlinkSync('/home/ubuntu/adbResult' + app + '_log.txt');
      await persist({
        id_ejecucion: executionId,
        ruta_archivo: data.Location
      });
      await updateExecution(executionId, 'ejecutado');
    });
  });
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
