const AWS = require('aws-sdk');
const query = require('./strategyTest.controller');
const execution = require('./execution.controller');
const web = require('./web.controller');
const movil = require('./movil.controller');

AWS.config.update({ region: 'us-east-1' });

const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/random.fifo';
const sqs = new AWS.SQS();
const params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: ['All'],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};

const queue = () => {
  //Recieve message from queue
  sqs.receiveMessage(params, async (err, data) => {
    if (err) {
      console.log('Receive Error', err);
    } else if (data.Messages) {
      const message = JSON.parse(data.Messages[0].Body);
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle,
      };
      deleteMessage(deleteParams);
      const st = await query(
        message.id_ejecucion,
        message.id_prueba,
        message.id_app
      );
      if (!st) {
        console.log('estrategiaPrueba not found');
      } else {
        if (st.estado === 'registrado') {
          await execution(message.id_ejecucion, 'pendiente');
          let headless, headful;
          if (st.modo_prueba === 'headless') {
            headless = true;
            headful = false;
          } else {
            headless = false;
            headful = true;
          }
          if (st.tipo_app === 'web') {
            await web(
              message.ruta_script,
              headless,
              headful,
              message.id_estrategia,
              message.id_prueba,
              message.id_ejecucion,
              message.navegadores,
              message.vrt,
              message.ruta_app_vrt
            );
          } else {
            await movil(
              message.ruta_app,
              message.dispositivos,
              message.parametro,
              message.id_estrategia,
              message.id_prueba,
              message.id_ejecucion,
              message.vrt,
              message.ruta_app_vrt
            );
          }
        }
      }
    }
  });
};

//Delete message from queue
const deleteMessage = (deleteParams) => {
  sqs.deleteMessage(deleteParams, (err, data) => {
    if (err) {
      console.log('Delete Error', err);
    } else {
      console.log('Message Deleted', data);
    }
  });
};

module.exports = queue;
