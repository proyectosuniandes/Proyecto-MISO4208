const AWS = require('aws-sdk');
const queryStrategy = require('./strategy');
const execution = require('./execution');
const web = require('./executeweb');
const idapp = require('./app');

AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS();
const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/e2e.fifo';
const params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: ['All'],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0
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
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      deleteMessage(deleteParams);
      const strategyTest = await queryStrategy(
        message.id_ejecucion,
        message.id_prueba,
        message.id_app,
        message.id_estrategia
      );

      if (!strategyTest) {
        console.log('estrategiaPrueba not found');
      } else {
        
        message.navegadores.forEach( async (record) => {
          
          if (strategyTest[0].estado === 'registrado') {
            await execution(message.id_ejecucion, 'pendiente');
            let headless, headful;
            if (strategyTest[0].modo_prueba === 'headless') {
              headless = true;
              headful=false;
            } else {
              headless = false;
              headful=true;
            }
            
            let navegador = record.tipo;

            const versionApp = await idapp(
              message.id_app,
              message.ruta_app
            );

            await web(
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
              const versionVrt= await idapp(
                message.id_app,
                message.ruta_app_vrt
              );
              await web(
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
    }
  });
};

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

module.exports = queue;