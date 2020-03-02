const fs = require("fs");
let shell = require("shelljs");
const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");

app = express();

/*var task = cron.schedule('* * * * *', () => {
	console.log('Printing this line every minute in the terminal');
});*/
// To backup a database
var task=cron.schedule("* * * * *", function() {
  console.log("---------WORKER E2E------------");
  console.log("Running Cypress");
  var pathTest="./node_modules/.bin/cypress run --spec \"./cypress/integration/simple_spec.js\"";
 if (shell.exec(pathTest).code !== 0) { //./node_modules/.bin/cypress run --spec "cypress/integration/simple_spec.js" --record
    shell.exit(1);
  } else {
    shell.echo("Cypress complete");
  }
});
task.start();
app.listen("3128");