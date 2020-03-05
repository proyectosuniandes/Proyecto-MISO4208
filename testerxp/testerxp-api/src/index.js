const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var uuid = require('uuid');

//Environment Variables
const dotenv = require('dotenv');
dotenv.config();

//Initializations
const app = express();
var cors = require('cors');
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Expose-Headers", "X-Total-Count");
  res.header("Access-Control-Expose-Headers", "Content-Range");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});


//settings
app.set('port', process.env.PORT || 8080);

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Routes
require('./routes/application.routes.js')(app);
require('./routes/typeapp.routes.js')(app);
require('./routes/test.routes.js')(app);
require('./routes/strategy.routes.js')(app);

app.use('/script', require('./routes/script'));
app.use('/estado-prueba', require('./routes/estado-prueba'));
app.use('/tipo-prueba', require('./routes/tipo-prueba'));
app.use('/version', require('./routes/version'));
app.use('/historico-prueba', require('./routes/historico-prueba'));

//dispatcher worker
app.use('/queue', require('./dispatcher/queue'));


// define a simple route
app.get('/', (req, res) => {
  res.json({ "message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes." });
});

//Starting the server
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});


/*
app.get('/prueba-sqs', (req, res) => {
  var vRequest = JSON.stringify({
    id: uuid.v4(),
    date: (new Date()).toISOString()
  });
  console.log("Request", vRequest); 
});*/