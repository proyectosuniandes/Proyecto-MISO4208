const express = require('express');
const morgan = require('morgan');
const cron = require('node-cron');
const AWS = require('aws-sdk');

//initializations
const app = express();
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
//settings
app.set('port', process.env.PORT || 8080);

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Rutes
const StrategyTest = require('./models/estrategiaPrueba');
const Strategy = require('./models/estrategia');
const Test = require('./models/prueba');
const Execution = require('./models/ejecucion');

//Initialize cron
const task = cron.schedule('* * * * * ', () => {
  console.log('***** Initializing Cron *****');
  const sqs = new AWS.SQS();
  sqs.receiveMessage(params, async (err, data) => {
    if (err) {
      console.log('Receive Error', err);
    } else if (data.Messages) {
      const strategyTest = JSON.parse(data.Messages[0].Body);
      const record = await findOne(
        strategyTest.Estrategia_ID,
        strategyTest.Prueba_ID
      );
      await updateExecution(record.id_ejecucion, 'pendiente');
      //TODO: cypress and ADB//
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      sqs.deleteMessage(deleteParams, async (err, data) => {
        if (err) {
          console.log('Delete Error', err);
        } else {
          console.log('Message Deleted', data);
          await updateExecution(record.id_ejecucion, 'ejecutado');
        }
      });
    }
  });
});

async function findOne(strategyId, testId) {
  console.log('***** FindOne StrategyTest *****');
  try {
    const record = await StrategyTest.findOne({
      where: {
        id_estrategia: strategyId,
        id_prueba: testId
      },
      include: [
        { model: Test, as: 'prueba' },
        { model: Strategy, as: 'estrategia' }
      ],
      raw: true
    });
    if (!record) {
      return null;
    }
    return record;
  } catch (e) {
    console.log(e);
    return null;
  }
}

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
//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
