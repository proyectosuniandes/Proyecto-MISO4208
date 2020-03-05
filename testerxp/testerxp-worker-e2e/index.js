const fs = require("fs");
let shell = require("shelljs");
const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");
const { Sequelize } = require('sequelize');
const sequelize = require('./database/database');
HistoricoPrueba = require('./models/HistoricoPrueba');
Prueba = require('./models/Prueba');
Script = require('./models/Script');

app = express();

/*var task = cron.schedule('* * * * *', () => {
	console.log('Printing this line every minute in the terminal');
});*/
// To backup a database
var task=cron.schedule("* * * * *", function() {
  console.log("---------WORKER E2E------------");

  // '2'
  //estado
  /*HistoricoPrueba.find({estado:'1'},null, {skip:0, limit: 1}).then(execs => {
        console.log("-execs-"+execs);
        
      }).catch(err => {
        console.log("---------WORKER ERROR------------")+err;
      });*/

  //busca execuciones en estado Registrado
  HistoricoPrueba.findOne(
    { 
      where: {estado : 1}
    }
  //HistoricoPrueba.findOneAndUpdate(
  //  { estado:'1' }, //1     Executed
  //  { $set: { estado: '2' } },
  //  {
  //    returnNewDocument: true
  //  }
  ).then(exec => {
    var pathSript;
    if(exec){
      console.log("-execs-"+exec);
      //consulta el Prueba para obtener el script
      Prueba.findByPk(exec.prueba, 
      ).then(test =>{
        pathScript="./cypress/integration/"+exec.prueba+".js";
        Script.findByPk(test.script
        ).then(script =>{
          console.log(script);
          fs.writeFile(pathScript, script.contenido, function(err) {
            if(err) {
              return console.log(err);
            }
          });
          console.log("The file "+exec.prueba+" was saved!");
          console.log("Running Cypress");
          var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/"+exec.prueba+".js\"";
          if (shell.exec(pathTest).code !== 0) {
            shell.exit(1);
            HistoricoPrueba.updateOne({ id_his: exec.id_his }, { estado: '1' }).then(u=>{
              console.log("HistoricoPrueba id:" +exec.id_his+" Failed.");
            });
          } else {
            shell.echo("Cypress complete");
            HistoricoPrueba.updateOne({ id_his: exec.id_his }, { estado: '3' }).then(u=>{
              console.log("HistoricoPrueba id:" +exec.id_his+" Executed.");
            });
          }
        });
        
        
      });
      // Prueba.findByPk(exec.prueba, function (err, test) {
        // console.log(test);
        // if(err) {
          // return console.log(err);
        // }
        // pathScript="./cypress/integration/"+exec.prueba+".js";
        // fs.writeFile(pathScript, test.tests[0].script, function(err) {
          // if(err) {
            // return console.log(err);
          // }
        // });
        // console.log("The file "+exec.prueba+" was saved!");
        // console.log("Running Cypress");
        // /*     --reporter mochawesome --reporter-options \"mochaFile=cypress/results/my-test-output.xml,html=true\"*/
        //var report=" --reporter mochawesome --reporter-options \"mochaFile=cypress/results/"+exec.prueba+".html,html=true\"";
        // var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/"+exec.prueba+".js\"";//+report;
        // if (shell.exec(pathTest).code !== 0) { //./node_modules/.bin/cypress run --spec "cypress/integration/examples/window.spec.js" --record
          // shell.exit(1);
          // HistoricoPrueba.updateOne({ id_his: exec.id_his }, { estado: '1' }).then(u=>{
            // console.log("HistoricoPrueba id:" +exec.id_his+" Failed.");
          // });
        // } else {
          // shell.echo("Cypress complete");
          // HistoricoPrueba.updateOne({ id_his: exec.id_his }, { estado: 'Executed' }).then(u=>{
            // console.log("HistoricoPrueba id:" +exec.id_his+" Executed.");
          // });
        // }
      // });
    }else{
      console.log("-----NO HAY PRUEBAS POR EJECUTAR------");
    }
  }).catch(err => {
    if(exec.id_prueba )
    HistoricoPrueba.updateOne({ id_his: exec.id_prueba }, { estado: '1' }).exec();
    console.log("---------WORKER ERROR------------")+err;
  });
});
task.start();
app.listen("3128");

//mongoose.Promise = global.Promise;
// Connecting to the database
//mongoose.connect(dbConfig.url, {
//  useNewUrlParser: true,
//  useFindAndModify: false,
//  useUnifiedTopology: true
//}).then(() => {
//  console.log("Successfully connected to the database");
//}).catch(err => {
//  console.log('Could not connect to the database. Exiting now...', err);
//  process.exit();
//});

//  console.log("Running Cypress");
//  var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/simple_spec.js\"";
// if (shell.exec(pathTest).code !== 0) { //./node_modules/.bin/cypress run --spec "cypress/integration/simple_spec.js" --record
//    shell.exit(1);
//  } else {
//    shell.echo("Cypress complete");
//  }
//});
//task.start();
//app.listen("3128");