const express = require('express');
const cron = require('node-cron');
const queue = require('./controllers/queue.controller');
//initializations
const app = express();

//settings
app.set('port', process.env.PORT || 8080);

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Initialize cron
const task = cron.schedule('* * * * *', () => {
  console.log('***** Initializing Cron *****');
  queue();
});

//Starting the server
task.start();
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
