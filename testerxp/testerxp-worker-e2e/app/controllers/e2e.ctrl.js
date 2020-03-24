'use strict'
var express = require('express')
var router = express.Router();

var cron = require('node-cron'); 
var sqs = require('../../sqs/sqs.js') 

const execute = () => {
    sqs.getSqs(function(apps){
        console.log("Ejecucion E2E test");
    });
}

var task = cron.schedule('5 * * * *', execute, {scheduled:true});

router.get('/start', (req,res) => {
    execute();
    task.start();
    res.send('Cron iniciado')

});

router.get('/stop', (req,res) => {
    task.stop()
    res.send('Worker detenido')
});

module.exports = router;