const express = require("express");
const cron = require('node-cron');

var AWS = require("aws-sdk");
var queueURL = "https://sqs.us-east-1.amazonaws.com/973067341356/dispatcher.fifo";

AWS.config.update({region: 'us-east-1'});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  AttributeNames: [
     "SentTimestamp"
  ],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: [
     "All"
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0
};

var app = express();

app.set('port', process.env.PORT || 8080);

const task = cron.schedule('* * * * *', () => {
  console.log("checking queue for messages...");
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      var sqsURL;
      var messageprueba = data.Messages[0].Body;
      console.log(messageprueba);
      var exec1 = JSON.parse(messageprueba);
      console.log(exec1);
      switch (exec1.tipo_prueba) {
        case 'E2E':
          sqsURL='https://sqs.us-east-1.amazonaws.com/973067341356/e2e.fifo';
          break;
        case 'random':
          sqsURL='https://sqs.us-east-1.amazonaws.com/973067341356/random.fifo';
          break;
        case 'BDT':
          sqsURL='https://sqs.us-east-1.amazonaws.com/973067341356/bdt.fifo';
          break;
        default:
          console.log('NO EJECUCION');
      }
      console.log("COLA A EJECUTAR: ", sqsURL);
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      var sendParams = {
        MessageAttributes: data.Messages.MessageAttributes,
        MessageBody: data.Messages[0].Body,
        MessageDeduplicationId: data.Messages[0].MessageId,  // Required for FIFO queues
        MessageGroupId: data.Messages[0].MessageId,  // Required for FIFO queues
        QueueUrl: sqsURL        
      };

      sqs.sendMessage(sendParams, function(err, data1) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data1.MessageId);
        }
      });
      sqs.deleteMessage(deleteParams, function(err, data2) {
        if (err) {
          console.log("Delete Error", err);
        } else {
          console.log("Message Deleted", data2);
        }
      });
    }
  });
});
//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});