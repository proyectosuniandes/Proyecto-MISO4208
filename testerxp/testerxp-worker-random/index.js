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

var task=cron.schedule("* * * * *", function() {
  console.log("---------WORKER E2E------------");

  //busca execuciones en estado Registrado
  HistoricoPrueba.findOne(
    { 
      where: {
        estado : 1        
      }
    }
  ).then(exec => {
    var pathSript;
    if(exec){      
      console.log("-execs-"+exec);
      //consulta el Prueba para obtener el script
      Prueba.findOne(
        { 
          where: {
            id_prueba : exec.prueba,
            tipo : 2
          }
        } 
      ).then(test =>{
        HistoricoPrueba.update({
          estado : 2,
          fecha_inicio : new Date()
        },{
          where: {id_his: exec.id_his}
        }).then(u=>{
          console.log("HistoricoPrueba id:" +exec.id_his+" Pending.");
        });
        pathScript="./cypress/integration/"+exec.prueba+".js";
        Script.findByPk(test.script
        ).then(script =>{
          fs.writeFile(pathScript, script.contenido, function(err) {
            if(err) {
              return console.log(err);
            }
          });
          console.log("The file "+exec.prueba+" was saved!");
          console.log("Running Cypress");
          //var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/"+exec.prueba+".js\"";
          var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/monkey_testing_ripper_random_spec.js\"";
          if (shell.exec(pathTest).code !== 0) {
            shell.exit(1);
            HistoricoPrueba.update({
              estado: 1
            },{
              where: {id_his: exec.id_his}
            }).then(u=>{
              console.log("HistoricoPrueba id:" +exec.id_his+" Failed.");
            });
          } else {
            shell.echo("Cypress complete");
            HistoricoPrueba.update({
              estado: 3,
              fecha_fin : new Date()
            },{
              where: {id_his: exec.id_his}
            }).then(u=>{
              console.log("HistoricoPrueba id:" +exec.id_his+" Executed.");
            });
          }
        });      
      });      
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
