const { list, get, uploadFiles } = require('./s3.controller.js');
const fs = require('fs');
const path = require('path');
const cypress = require('cypress');
const result = require('./result.controller');
const execution = require('./execution.controller');

//execute random script with cypress
const web = async (rutaScript,headless,headful,strategyId,testId,executionId,navegadores,vrt,vrtRoute) => {
  console.log('***** Executing Web Random *****');
  const split = rutaScript.split('.com/');
  const prefix = split[1];
  const files = await list(prefix+'/');
  fs.mkdirSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + ''),{recursive: true});
  let i = 0;
  while(i< files.length){
    let nameScript = files[i].Key.split('/');
    nameScript = nameScript[nameScript.length - 1];
    const file = await get(files[i].Key);
    fs.writeFileSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript),file);
    console.log('file to be tested: ', nameScript);
    await executeBrowsers(navegadores,headful,headless,nameScript,strategyId,testId,executionId);
    console.log('executed');
    await uploadResults(navegadores,strategyId,testId,executionId,nameScript);
    console.log('finished uploading files');
    i++;
  }
  await result(executionId,' https://miso-4208-grupo3.s3.us-east-2.amazonaws.com/results/' +strategyId +'/' +testId +'/' +executionId);
  console.log('result created');
  await execution(executionId, 'ejecutado');
  console.log('finished');
};

const executeBrowsers= (navegadores,headful,headless,nameScript,strategyId,testId,executionId)=>{
  return new Promise((resolve)=>{
    let promises = [];
    navegadores.forEach((n) => {
      const execution = cypress.run({
        browser: n.tipo,
        config: {
          screenshotsFolder: path.join(__dirname,'../../cypress/screenshots',n.tipo),
          videosFolder: path.join(__dirname, '../../cypress/videos/', n.tipo),
          trashAssetsBeforeRuns: false,
          chromeWebSecurity: false,
        },
        headed: headful,
        headless: headless,
        reporter: 'mochawesome',
        reporterOptions: {
          reportFilename: nameScript,
          reportDir: path.join(__dirname,'../../cypress/results',n.tipo,strategyId + '',testId + '',executionId + ''),
          html: false,
          json: true,
          quiet: true,
        },
        spec: path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript)
      });
      promises.push(execution);
    });
    Promise.all(promises).then(() => {
      fs.unlinkSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript));
      resolve('done');
    });
  });
}

const uploadResults = (navegadores,strategyId,testId,executionId,nameScript)=>{
  return new Promise((resolve)=>{
    let promisesUpload = [];
    navegadores.forEach(async(n) => {
      promisesUpload.push(uploadFiles(path.join(__dirname,'../../cypress/screenshots',n.tipo + '',strategyId + '',testId + '',executionId + '',nameScript),'/results/' + strategyId + '/' + testId + '/' + executionId+ '/vrt',n.tipo + '_' + nameScript));
      promisesUpload.push(uploadFiles(path.join(__dirname,'../../cypress/videos',n.tipo + '',strategyId + '',testId + '',executionId + ''),'/results/' + strategyId + '/' + testId + '/' + executionId,n.tipo + '_' + nameScript));
      promisesUpload.push(uploadFiles(path.join(__dirname,'../../cypress/results',n.tipo + '',strategyId + '',testId + '',executionId + ''),'/results/' + strategyId + '/' + testId + '/' + executionId,n.tipo + '_' + nameScript));
    });
    Promise.all(promisesUpload).then(() => {
      resolve('done');
    });
  })
}
module.exports = web;