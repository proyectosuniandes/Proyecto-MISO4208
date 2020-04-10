const { list, get, uploadFiles } = require('./s3.controller.js');
const fs = require('fs');
const path = require('path');
const cypress = require('cypress');
const result = require('./result.controller');
const execution = require('./execution.controller');

//execute random script with cypress
const web = async (
  rutaScript,
  headless,
  headful,
  strategyId,
  testId,
  executionId,
  navegadores
) => {
  console.log('***** Executing Web Random *****');
  const split = rutaScript.split('.com/');
  const prefix = split[1];
  const files = await list(prefix);
  files.forEach(async (f) => {
    let nameScript = f.Key.split('/');
    nameScript = nameScript[nameScript.length - 1];
    const file = await get(f.Key);
    fs.mkdirSync(
      path.join(
        __dirname,
        '../../cypress/integration',
        strategyId + '',
        testId + '',
        executionId + ''
      ),
      {
        recursive: true,
      }
    );
    fs.writeFileSync(
      path.join(
        __dirname,
        '../../cypress/integration',
        strategyId + '',
        testId + '',
        executionId + '',
        nameScript
      ),
      file
    );
    let promises = [];
    navegadores.forEach((n) => {
      const execution = cypress.run({
        browser: n.tipo,
        config: {
          screenshotsFolder: path.join(
            __dirname,
            '../../cypress/screenshots',
            n.tipo
          ),
          videosFolder: path.join(__dirname, '../../cypress/videos/', n.tipo),
          chromeWebSecurity: false,
        },
        headed: headful,
        headless: headless,
        reporter: 'mochawesome',
        reporterOptions: {
          reportFilename: nameScript,
          reportDir: path.join(
            __dirname,
            '../../cypress/results',
            n.tipo,
            strategyId + '',
            testId + '',
            executionId + ''
          ),
          html: false,
          json: true,
          quiet: true,
        },
        spec: path.join(
          __dirname,
          '../../cypress/integration',
          strategyId + '',
          testId + '',
          executionId + '',
          nameScript
        ),
      });
      promises.push(execution);
    });
    Promise.all(promises).then(async () => {
      fs.unlinkSync(
        path.join(
          __dirname,
          '../../cypress/integration',
          strategyId + '',
          testId + '',
          executionId + '',
          nameScript
        )
      );
      let promisesUpload = [];
      navegadores.forEach((n) => {
        promisesUpload.push(
          uploadFiles(
            path.join(
              __dirname,
              '../../cypress/screenshots',
              n.tipo + '',
              strategyId + '',
              testId + '',
              executionId + '',
              nameScript
            ),
            '/results/' + strategyId + '/' + testId + '/' + executionId,
            n.tipo + '_' + nameScript
          )
        );
        promisesUpload.push(
          uploadFiles(
            path.join(
              __dirname,
              '../../cypress/videos',
              n.tipo + '',
              strategyId + '',
              testId + '',
              executionId + ''
            ),
            '/results/' + strategyId + '/' + testId + '/' + executionId,
            n.tipo + '_' + nameScript
          )
        );
        promisesUpload.push(
          uploadFiles(
            path.join(
              __dirname,
              '../../cypress/results',
              n.tipo + '',
              strategyId + '',
              testId + '',
              executionId + ''
            ),
            '/results/' + strategyId + '/' + testId + '/' + executionId,
            n.tipo + '_' + nameScript
          )
        );
      });
      Promise.all(promisesUpload).then(async () => {
        console.log('finaliza upload');
        await result(
          executionId,
          ' https://miso-4208-grupo3.s3.us-east-2.amazonaws.com/results/' +
            strategyId +
            '/' +
            testId +
            '/' +
            executionId
        );
        await execution(executionId, 'ejecutado');
      });
    });
  });
};

module.exports = web;
