// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  //DelaySeconds: 10,
  MessageAttributes: {
    "Title": {
      DataType: "String",
      StringValue: "The Whistler"
    },
    "Author": {
      DataType: "String",
      StringValue: "John Grisham"
    },
    "WeeksOn": {
      DataType: "Number",
      StringValue: "6"
    }
  },
  MessageBody: '{ "TipoPruebas":"vrt", "age":30, "city":"New York"}',//"Information about current NY Times fiction bestseller for week of 12/11/2016.",
  MessageDeduplicationId: "vrt",  // Required for FIFO queues
  MessageGroupId: "vrt",  // Required for FIFO queues
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/973067341356/dispatcher.fifo"
};

sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});