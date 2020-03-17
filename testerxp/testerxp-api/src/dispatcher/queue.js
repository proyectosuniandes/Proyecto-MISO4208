const express = require('express');
const router = express.Router();

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.SQS_KEY_ID,
    secretAccessKey: process.env.SQS_KEY_PASSWORD
});

const sqs = new AWS.SQS({ apiVersion: '2020-03-02' });
const accountId = '973067341356';
const queueName = 'testerxp';
const queueUrl = `${process.env.SQS_HOST}/${accountId}/${queueName}`;

//Example
//http://localhost:8080/queue/send/{ "id": "36", "mensaje": "hola mundo" }
router.put('/send/:msg', async (req, res) => {
    const { msg } = req.params;
    const params = {
        MessageBody: msg,
        QueueUrl: queueUrl
    };

    sqs.sendMessage(params, (err, data) => {
        if (err) {
            var vTitle = "There is an error";
            console.log(vTitle, err);
            res.json({ "There is an error": err });
        } else {
            var vTitle = "Successfully added message";
            console.log(vTitle, data);
            res.json(data);
        }
    });
});

//Example
//http://localhost:8080/queue/receive
router.get('/receive', (req, res) => {
    const params = {
        QueueUrl: queueUrl
    };

    sqs.receiveMessage(params, (revErr, revData) => {
        if (revErr) {
            var vTitle = "There is an error";
            console.log(vTitle, revErr);
            res.json({ "There is an error": revErr });
        } else {
            var vTitle = "Successfully received message";
            console.log(vTitle, revData);

            if (revData.Messages) {
                var params = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: revData.Messages[0].ReceiptHandle
                };

                sqs.deleteMessage(params, function (delErr, delData) {
                    if (delErr) {
                        var vTitle = "There is an error";
                        console.log(vTitle, delErr);
                        res.json({ "There is an error": delErr });
                    }
                    else {
                        var vTitle = "Successfully deleted message";
                        console.log(vTitle, delData);
                        res.json(revData);
                    }
                });
            }
            else
            {
                res.json(revData);
            }
        }
    });
});

module.exports = router;