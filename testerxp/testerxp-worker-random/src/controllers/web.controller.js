const {list, get, uploadFiles} = require('./s3.controller.js');
const fs = require('fs'); 
const path = require('path');
const cypress = require('cypress');
const result = require('./result.controller');
const execution = require('./execution.controller');

//execute random script with cypress
const web = async (rutaScript,strategyId,testId,executionId,navegadores,appRoute,headful,headless,versionId,vrt,vrtRoute,vrtVersion) => {
  console.log('***** Executing Web Random *****');
  let prefix = rutaScript.split('.com/');
  prefix = prefix[1];
  const files = await list(prefix+'/');
  fs.mkdirSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + ''),{recursive: true});
  let i = 0;
  while(i< files.length){
    let nameScript = files[i].Key.split('/');
    nameScript = nameScript[nameScript.length - 1];
    const file = await get(files[i].Key);
    fs.writeFileSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript),file);
    await executeBrowsers(navegadores,appRoute,versionId, headful,headless,nameScript,strategyId,testId,executionId);
    await uploadResults(navegadores,versionId,strategyId,testId,executionId,nameScript);
    if (vrt){
      await executeBrowsers(navegadores,vrtRoute,vrtVersion, headful,headless,nameScript,strategyId,testId,executionId);
      await uploadResults(navegadores,vrtVersion,strategyId,testId,executionId,nameScript);
    }
    fs.unlinkSync(path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript));
    i++;
  }
  console.log('executed and files uploaded');
  await result(executionId,' https://miso-4208-grupo3.s3.us-east-2.amazonaws.com/results/' +strategyId +'/' +testId +'/' +executionId);
  console.log('result created');
  await execution(executionId, 'ejecutado');
  console.log('finished');
};

const executeBrowsers= (navegadores,appRoute,versionId,headful,headless,nameScript,strategyId,testId,executionId)=>{
  return new Promise((resolve)=>{
    let promises = [];
    navegadores.forEach((n) => {
      const execution = cypress.run({
        browser: n.tipo,
        config: {
          baseUrl: appRoute,
          screenshotsFolder: path.join(__dirname,'../../cypress/screenshots',versionId+'_'+n.tipo),
          videosFolder: path.join(__dirname, '../../cypress/videos/', versionId+'_'+n.tipo),
          trashAssetsBeforeRuns: false,
          chromeWebSecurity: false,
        },
        headed: headful,
        headless: headless,
        reporter: 'mochawesome',
        reporterOptions: {
          reportFilename: nameScript,
          reportDir: path.join(__dirname,'../../cypress/results',versionId+'_'+n.tipo,strategyId + '',testId + '',executionId + ''),
          html: true,
          json: true,
          quiet: true,
        },
        spec: path.join(__dirname,'../../cypress/integration',strategyId + '',testId + '',executionId + '',nameScript)
      });
      promises.push(execution);
    });
    Promise.all(promises).then(() => {
      resolve('done');
    });
  });
}

const uploadResults =(navegadores,versionId,strategyId,testId,executionId,nameScript)=>{
  return new Promise(async (resolve)=>{
    let i =0;
    while(i < navegadores.length){
      await uploadFiles(path.join(__dirname,'../../cypress/screenshots',versionId+'_'+navegadores[i].tipo + '',strategyId + '',testId + '',executionId + '',nameScript),'/results/' + strategyId + '/' + testId + '/' + executionId+ '/VRT',versionId+'_'+navegadores[i].tipo);
      await uploadFiles(path.join(__dirname,'../../cypress/videos',versionId+'_'+navegadores[i].tipo + '',strategyId + '',testId + '',executionId + ''),'/results/' + strategyId + '/' + testId + '/' + executionId+'/'+versionId+'_'+navegadores[i].tipo,null);
      await uploadFiles(path.join(__dirname,'../../cypress/results',versionId+'_'+navegadores[i].tipo + '',strategyId + '',testId + '',executionId + ''),'/results/' + strategyId + '/' + testId + '/' + executionId+'/'+versionId+'_'+navegadores[i].tipo,null);
      i++;
    }
    resolve('done');
  });
}
module.exports = web;