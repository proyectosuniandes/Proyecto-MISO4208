const express = require('express');
const morgan = require('morgan');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region we will be using
AWS.config.update({region: 'us-east-1'});

//Initializations
const app = express();

//settings
app.set('port', process.env.PORT || 8080);

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routes
app.use('/script', require('./routes/script'));
app.use('/estado-prueba', require('./routes/estado-prueba'));
app.use('/tipo-prueba', require('./routes/tipo-prueba'));
app.use('/tipo-app', require('./routes/tipo-app'));
app.use('/app', require('./routes/app'));
app.use('/version', require('./routes/version'));
app.use('/prueba', require('./routes/prueba'));
app.use('/historico-prueba', require('./routes/historico-prueba'));

//Starting the server
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

// Create SQS service client
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
// Replace with your account id and the queue name you setup
const accountId = '1234567';
const queueName = 'test';
// Setup the sendMessage parameter object
const params = {
  MessageBody: JSON.stringify({
    order_id: 1234,
    date: (new Date()).toISOString()
  }),
  QueueUrl: `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`
};
sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Successfully added message", data.MessageId);
  }
});