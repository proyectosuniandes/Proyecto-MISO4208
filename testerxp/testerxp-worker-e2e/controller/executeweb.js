const { list, get, uploadFiles } = require('./s3');
const fs = require('fs');
const path = require('path');
const cypress = require('cypress');
const result = require('./result');
const execution = require('./execution');

//execute random script with cypress
const web = async (rutaScript, headless, headful, navegador, vrt, rutaApp, versionApp, strategyId, testId, executionId) => {
    console.log('***** Executing Web E2E *****');
    const split = rutaScript.split('.com/');
    const prefix = split[1];
    const files = await list(prefix);
    
    files.forEach(async (f) => {
      let nameScript = f.Key.split('/');
      if (nameScript[2] != ''){
        nameScript = nameScript[nameScript.length - 1];
        const file = await get(f.Key);
        // fs.mkdirSync(path.join(__dirname, '../../cypress/integration', strategyId + '', testId + '', executionId + ''),
        //   {
        //     recursive: true,
        //   }
        // );
        fs.writeFileSync(path.join(__dirname, '../cypress/integration', executionId+''+versionApp+navegador+nameScript),
          file
        );
        let promises = [];
        console.log('cypress run')
        const execution = cypress.run({
          browser: navegador,
          config: {
            // screenshotsFolder: path.join(__dirname, '../../cypress/screenshots', n.tipo),
            // videosFolder: path.join(__dirname, '../../cypress/videos/', n.tipo),
            chromeWebSecurity: false,
            baseUrl: rutaApp
          },
          headed: headful,
          headless: headless,
          reporter: 'mochawesome',
          reporterOptions: {
            reportFilename: executionId+''+versionApp+navegador+nameScript,
            reportDir: path.join(__dirname, '../cypress/results'),
            html: false,
            json: true,
            quiet: true,
          },
          spec: path.join(__dirname, '../cypress/integration', executionId+''+versionApp+navegador+nameScript),
        });
        console.log('promises')
        promises.push(execution);
  
        Promise.all(promises).then(async () => {
          fs.unlinkSync(path.join(__dirname, '../../cypress/integration', strategyId + '', testId + '', executionId + '', nameScript));
          let promisesUpload = [];
          navegadores.forEach((n) => {
            promisesUpload.push(
              uploadFiles(
                path.join(__dirname, '../../cypress/screenshots', n.tipo + '', strategyId + '', testId + '', executionId + '', nameScript),
                '/results/' + strategyId + '/' + testId + '/' + executionId,
                n.tipo + '_' + nameScript
              )
            );
            promisesUpload.push(
              uploadFiles(
                path.join(__dirname, '../../cypress/videos', n.tipo + '', strategyId + '', testId + '', executionId + ''),
                '/results/' + strategyId + '/' + testId + '/' + executionId,
                n.tipo + '_' + nameScript
              )
            );
            promisesUpload.push(
              uploadFiles(
                path.join(__dirname, '../../cypress/results', n.tipo + '', strategyId + '', testId + '', executionId + ''),
                '/results/' + strategyId + '/' + testId + '/' + executionId,
                n.tipo + '_' + nameScript
              )
            );
          });
          Promise.all(promisesUpload).then(async () => {
            console.log('finaliza upload');
            await result(executionId, ' https://miso-4208-grupo3.s3.us-east-2.amazonaws.com/results/' + strategyId + '/' + testId + '/' + executionId);
            await execution(executionId, 'ejecutado');
          });
        });
        
      }
      
    });
  };
  
  module.exports = web;
