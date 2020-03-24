var AWS = require('aws-sdk');
var cypressService = require('../app/services/e2e.srv.js');
const Execution = require('./models/ejecucion');



AWS.config.update({region:'us-east-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const sqsUrl = 'https://sqs.us-east-1.amazonaws.com/973067341356/e2e.fifo';

module.exports.getSqs = function(req,success,error){
    console.log("sqs init ..")
    var params = {
      AttributeNames: [
        'SentTimestamp'
      ],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: [
        'All'
      ],
      QueueUrl: sqsUrl,
      VisibilityTimeout: 120,
      WaitTimeSeconds: 20
    };

    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log('Error', err);
      } else if (data.Messages) {
          console.log(data.Messages[0])
        let payload = JSON.parse(data.Messages[0].Body);
        console.log('valor del payload: ', payload)
        executeService(payload,() => {
            console.log('ok test');
            sqsComplete(data.Messages[0].ReceiptHandle,payload.Ejecucion_ID);
            console.log("Proceso completo test");
          },
          (msg) =>{
            console.log('error test: ',msg);
          });

      }
    });

  };

  executeService = (req, success,error)=>{
    cypressService.generateCypress(req, function(apps){ 
        success({ status: "OK" });
    },function(err){
        error(err);
    })
  }

  updateBD = (code)=>{
    Execution.update({
      estado: 3
    },{
      where: {id_ejecucion: code}
    }).then(u=>{
      console.log("Ejecución id:" +code+" Executed.");
    });
  }

  const sqsComplete = (handle,code) => {
    var deleteParams = {
      QueueUrl: sqsUrl,
      ReceiptHandle: handle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log('Delete Error', err);
      } else {
        updateBD(code);
        console.log('Message Deleted', data);
      }
    });
  };