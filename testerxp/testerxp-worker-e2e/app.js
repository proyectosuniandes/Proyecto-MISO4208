'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();

var e2eController = require('./app/controllers/e2e.ctrl.js');

const port = 8004;

app.options('*', cors());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/test', [e2eController]);

app.use( function (req, res, next) {
    next();
});

app.listen(port, () => {
  console.log('Worker E2E listening on ' + port);
});