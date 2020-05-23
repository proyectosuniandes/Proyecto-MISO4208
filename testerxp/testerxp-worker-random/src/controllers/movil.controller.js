const path = require('path');
const { get } = require('./s3.controller.js');
const fs = require('fs');
let shell = require('shelljs');
const adb = require('adbkit');
const { uploadFiles } = require('./s3.controller.js');
const result = require('./result.controller');
const execution = require('./execution.controller');

const client = adb.createClient();

const movil = async (
  appRoute,
  devices,
  parameter,
  strategyId,
  testId,
  executionId,
  vrt,
  vrtRoute,
  id_version,
  id_vrt
) => {
  console.log('***** Executing Movil Random *****');
  const appName = path.posix.basename(appRoute);
  const app = await get(appName, '/app');
  fs.writeFileSync(path.join(__dirname, '../../adb', appName), app);
  let nameVrt;
  let appVrt;
  if (vrt){
    nameVrt = path.posix.basename(vrtRoute);
    appVrt = await get(nameVrt, '/app');
    fs.writeFileSync(path.join(__dirname, '../../adb', nameVrt), appVrt);
  }
  const dirResult = path.join(
    __dirname,
    '../../adbResult',
    strategyId + '',
    testId + '',
    executionId + ''
  );
  fs.mkdirSync(dirResult, {
    recursive: true,
  });
  if(vrt){
    console.log(dirResult);
    fs.mkdirSync(path.join(dirResult,'vrt'), {
      recursive: true,
    });
  }
  let i = 0;
  while (i < devices.length) {
    fs.mkdirSync(path.join(dirResult,devices[i].uuid),{recursive: true});
    const instance = await execute(devices[i]);
    await monkey(instance, appName, parameter, devices[i], dirResult, vrt, id_version);
    await uploadFiles(path.join(dirResult,devices[i].uuid),'/results/' + strategyId + '/' + testId + '/' + executionId+'/'+id_version+'_'+devices[i].uuid,null);
    if (vrt) {
      console.log('executing vrt on device ', devices[i] );
      const instanceVrt = await execute(devices[i]);
      await monkey(instanceVrt, nameVrt, parameter, devices[i], dirResult, vrt,id_vrt);
      await uploadFiles(path.join(dirResult,devices[i].uuid),'/results/' + strategyId + '/' + testId + '/' + executionId+'/'+id_vrt+'_'+devices[i].uuid,null);
    }
    i++;
  }
  console.log('all executed');
  fs.unlinkSync(path.join(__dirname, '../../adb', appName));
  if(vrt){
    fs.unlinkSync(path.join(__dirname, '../../adb', nameVrt));
  }
  await uploadFiles(path.join(dirResult,'vrt'),'/results/' + strategyId + '/' + testId + '/' + executionId+'/VRT',null);
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
  console.log('finished');
};

const execute = (device) => {
  return new Promise((resolve, reject) => {
    if (!device) {
      reject('no hay dispositivo');
    }
    console.log('starting instance', device.uuid);
    let instance = shell.exec(
      'gmsaas instances start ' + device.uuid + ' ' + device.uuid
    );
    instance = instance.stdout.trim();
    console.log('intsnace created', instance);
    console.log('conecting to adb');
    shell.exec('gmsaas instances adbconnect ' + instance);
    console.log('connected');
    resolve(instance);
  });
};

const monkey = (instance, appName, parameter, device, dirResult, vrt, version) => {
  return new Promise((resolve) => {
    client.listDevices().then(async (devices) => {
      await client.install(
        devices[0].id,
        path.join(__dirname, '../../adb', appName)
      );
      console.log('installed');
      shell.cd(process.env.ANDROID_SDK);
      console.log('executing ');
      if (vrt) {
        shell.exec('adb shell screencap /sdcard/download/initialScreen.png');
        shell.exec(
          'adb pull /sdcard/download/initialScreen.png ' +
            dirResult +'/vrt/'+version+'_'+device.uuid+'_initialScreen.png'
        );
      }
      shell.exec(
        './adb -s ' +
          devices[0].id +
          ' shell monkey ' +
          parameter +
          ' > ' +
          path.join(dirResult,device.uuid) +
          '/log.txt'
      );
      if (vrt) {
        shell.exec('adb shell screencap /sdcard/download/finalScreen.png');
        shell.exec(
          'adb pull /sdcard/download/finalScreen.png ' +
            dirResult +'/vrt/'+version+'_'+device.uuid+'_finalScreen.png'
        );
      }
      console.log('stoping instsnce');
      shell.exec('gmsaas instances stop ' + instance);
      resolve(instance);
    });
  });
};
module.exports = movil;
