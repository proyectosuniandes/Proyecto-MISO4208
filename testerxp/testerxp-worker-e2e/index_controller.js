const express = require('express');
const cron = require('node-cron');
const queue = require('./controller/sqs');
//initializations
const app = express();

//settings
app.set('port', process.env.PORT || 8080);

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Initialize cron
const task = cron.schedule('*/10 * * * * *', () => {
  console.log('***** Initializing E2E *****');
  queue();
});

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});