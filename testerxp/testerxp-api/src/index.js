const express = require('express');
const morgan = require('morgan');

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
