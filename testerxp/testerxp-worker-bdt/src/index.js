const express = require('express');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const {QueryTypes} = require('sequelize');
const path = require('path');
const fs = require('fs');
let shell = require('shelljs');
const s3 = new AWS.S3();
const bucket = 'miso-4208-grupo3';


//Initializations
const app = express();

//Settings
app.set('port', process.env.PORT || 8081);
AWS.config.update({region: 'us-east-1'});
const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/bdt.fifo';
const params = {
    AttributeNames: ['SentTimestamp'],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ['All'],
    QueueUrl: queueURL,
    VisibilityTimeout: 120,
    WaitTimeSeconds: 0
};

//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Routes
const sequelize = require('./database/database');
const Execution = require('./models/ejecucion');
const Result = require('./models/resultado');
const Version = require('./models/version');

//Initialize cron
const task = cron.schedule('* * * * *', () => {
    console.log('***** Initializing Cron *****');
    const sqs = new AWS.SQS();

    //Delete message from queue
    const deleteMessage = deleteParams => {
        sqs.deleteMessage(deleteParams, (err, data) => {
            if (err) {
                console.log('Delete Error', err);
            } else {
                console.log('Message Deleted', data);
            }
        });
    };

    //Recieve message from queue
    sqs.receiveMessage(params, async (err, data) => {
        if (err) {
            console.log('Receive Error', err);
        } else if (data.Messages) {
            const message = JSON.parse(data.Messages[0].Body);

            const deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };

            console.log(message)

            if (message.tipo_prueba === 'MUTANTE') {
                await deleteMessage(deleteParams);
                await executeMutation(message)
            } else {


                const strategyTest = await getStrategyTest(
                    message.id_ejecucion,
                    message.id_prueba,
                    message.id_app
                );
                deleteMessage(deleteParams);
                if (!strategyTest) {
                    console.log('estrategiaPrueba not found');
                } else {
                    console.log(strategyTest);
                    if (strategyTest.estado === 'registrado') {
                        await updateExecution(message.id_ejecucion, 'pendiente');
                        if (strategyTest.tipo_app === 'web') {
                            await executeWeb(
                                message.ruta_script,
                                strategyTest
                            );
                        } else {
                            //-- Movil
                            await executeMovil(
                                message,
                                message.ruta_script,
                                message.ruta_app,
                                strategyTest
                            );
                        }
                    }
                }


            }


        }
    });
});

//Find strategyTest given strategyId and testId
async function getStrategyTest(executionId, testId, appId) {
    try {
        const record = await sequelize.query(
            'select e.id_ejecucion, p.id_prueba, e.estado, p.modo_prueba, a.tipo_app from ejecucion e, prueba p, app a where e.id_ejecucion=$executionId and p.id_prueba = $testId and a.id_app = $appId',
            {
                bind: {
                    executionId: executionId,
                    testId: testId,
                    appId: appId
                },
                type: QueryTypes.SELECT,
                raw: true
            }
        );
        if (!record) {
            return null;
        }
        return record[0];
    } catch (e) {
        console.log(e);
        return null;
    }
}

//Update execution given executionId
async function updateExecution(executionId, estado) {
    await Execution.update(
        {estado: estado},
        {
            where: {
                id_ejecucion: executionId
            }
        }
    );
}


//execute Mutation
async function executeMutation(message) {


    var operadores = ["ActivityNotDefined", "DifferentActivityIntentDefinition", "InvalidActivityName",
        "InvalidKeyIntentPutExtra", "InvalidLabel", "NullIntent", "NullValueIntentPutExtra", "WrongMainActivity", "MissingPermissionManifest",
        "WrongStringResource"];



    //Crear el properties con lo seleccionado
    //await shell.exec("rm -Rf ./MutAPK/operators.properties");


    //let writer = fs.createWriteStream("./MutAPK/operators.properties")

    var selectedOp = message.operadores;
    var strOperadores = "";
    i = 0;
    while (i < selectedOp.length) {
        console.log(selectedOp[i] + ' = ' + operadores[selectedOp[i] - 1] + ',');
        //writer.write(selectedOp[i] + ' = ' + operadores[selectedOp[i] - 1] + '\n')
        strOperadores+=selectedOp[i] + ' = ' + operadores[selectedOp[i] - 1] + ','
        i++;
    }
    console.log(strOperadores);
    //writer.end() // close string

    //Descarga APK Inicia

    var apk = '';
    var paquete = message.paquete;

    if (message.version_app === 3) {
        apk = 'loop-1.7.11.apk'
        paquete = 'org.isoron.uhabits';
    } else if (message.version_app === 4) {
        apk = 'loop-1.7.2.apk'
        paquete = 'org.isoron.uhabits';
    } else if (message.version_app === 5) {
        apk = 'Calendula-productRelease-2.5.11.apk'
        paquete = 'es.usc.citius.servando.calendula';
    } else if (message.version_app === 6) {
        apk = 'Calendula-release-2.4.apk'
        paquete = 'es.usc.citius.servando.calendula';
    }

    //lanzar el comando

    var pathTest = "bash ./MutAPK/run_mutation.sh " + apk + " " + paquete + " " + selectedOp.length+" '"+strOperadores+"'";
    console.log('pathTest : ' + pathTest);
    await shell.exec(pathTest);

    //leer y persisitir los APK Mutantes
    const folderMutants = './MutAPK/mutants'
    fs.access(folderMutants, function (error) {
        if (error) {
            console.log("Directory Mutant does not exist.")
        } else {
            console.log("Directory exists.")
            const files = fs.readdirSync(folderMutants)
            i = 1;
            files.forEach(function (file) {
                console.log(file)
                if (fs.statSync( "./MutAPK/mutants/" + file).isDirectory()) {
                    let mutanteFolder = "./MutAPK/mutants/"+ file;
                    if (file === paquete + '-mutant' + i) {
                        filesApk = fs.readdirSync("./MutAPK/mutants/"  + file)
                        var extInx = apk.lastIndexOf('.');
                        let apkSigned = apk.substr(0,extInx) + '-aligned-debugSigned.apk';

                        filesApk.forEach(function (fileApk) {
                            if (!fs.statSync("./MutAPK/mutants/" +file+"/" + fileApk).isDirectory()) {
                                console.log(fileApk)
                                if (fileApk === apkSigned) {

                                    const apkFile = fs.readFileSync(
                                        path.join(__dirname,"../MutAPK/mutants/" +file+"/" + fileApk)
                                    );

                                    //-- Subir a S3
                                    uploadFile(apkFile,'MutAPK-'+apk.substr(0,extInx)+'-mutante-'+i,message);

                                    //-- Persistir Version


                                }
                            }
                        })

                    }
                    i++;
                }
            })

        }
    })


}


//execute test----
async function executeMovil(message, rutaScript, rutaApk, strategyTest) {
    await downloadFiles(strategyTest.id_prueba);
    await downloadApkFiles(rutaApk);
    if (message.dispositivos) {

        devices = message.dispositivos;

        i = 0;
        while (i < devices.length) {
            var device = devices[i].uuid;
            await runCalabash(strategyTest, message, device, rutaApk);
            i++;
        }

    }

    await uploadCalabashReport(strategyTest.id_ejecucion, message)
}


async function executeWeb(rutaScript, strategyTest) {
    await downloadFiles(strategyTest.id_prueba);
    await runCucumber(strategyTest);
    await uploadReport(strategyTest.id_ejecucion)
}


async function downloadApkFiles(pathApk) {
    const appName = path.posix.basename(pathApk);
    const app = await get(appName, '/app');
    fs.writeFileSync(path.join(__dirname, '../apks', appName), app);
    console.log(appName + ' has been created!');
}


const get = (key, app) => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: bucket,
            Key: key,
        };
        if (app !== undefined) {
            params.Bucket = bucket + app;
        }
        s3.getObject(params, async (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(data.Body);
        });
    });
};


async function downloadFiles(idPrueba) {

    const LOparams = {
        Bucket: bucket,
        Prefix: 'script/' + idPrueba + '/'
    };

    s3.listObjectsV2(LOparams, function (LOerr, LOdata) {
        if (LOerr) console.log(LOerr, LOerr.stack);

        console.log(LOdata);
        var length = LOdata.Contents.length;
        LOdata.Contents.forEach(file => {
            var GOparams = {
                Bucket: LOparams.Bucket,
                Key: file.Key
            };
            s3.getObject(GOparams, function (GOerr, GOdata) {
                if (GOerr) console.log(GOerr, GOerr.stack);

                var filename = path.basename(file.Key);
                var ext = path.extname(file.Key);
                if (ext) {
                    var target = ext === '.js' ? 'step-definitions' : ext === '.feature' ? 'features' : '';
                    fs.writeFileSync(
                        path.join(__dirname, '../' + target, filename),
                        GOdata.Body.toString()
                    );
                    console.log(filename + ' has been created!');

                }
            });
        });
    });

}


async function runCalabash(strategyTest, message, device, pathApk) {
    const appName = path.posix.basename(pathApk);
    console.log('**** Running Calabash in device :' + device);


    if (device === '5e4c60b3-327b-4fb4-98e2-4f996900e145') {
        device = 'Custom Tablet'
    }

    shell.exec("pwd")
    var pathTest = "bash ./genymotion/run_test.sh '" + device + "' " + appName
    console.log('pathTest : ' + pathTest);

    await shell.exec(pathTest)
    console.log('Calabash complete. ');
    updateExecution(strategyTest.id_ejecucion, 'ejecutado');


}


async function runCucumber(strategyTest) {
    return new Promise((resolve, reject) => {
        console.log('Running Cucumber...');
        var pathTest = strategyTest.modo_prueba === 'headless' ? 'node ./node_modules/selenium-cucumber-js/index.js -k none'
            : strategyTest.modo_prueba === 'headful' ? 'node ./node_modules/selenium-cucumber-js/index.js' : '';
        console.log(strategyTest.modo_prueba + ': ' + pathTest);

        if (shell.exec(pathTest).code !== 0) {
            shell.exit(1);
            console.log('Cucumber failed. ' + err);
        } else {
            console.log('Cucumber complete. ');
            updateExecution(strategyTest.id_ejecucion, 'ejecutado');
            resolve('OK');
        }
    });
}


async function uploadCalabashReport(idEjecucion, message) {
    return new Promise((resolve, reject) => {
        const appName = path.posix.basename(message.ruta_app);

        var reporter = require('cucumber-html-reporter');

        var options = {
            theme: 'bootstrap',
            jsonFile: 'calabash_report.json',
            output: './reports/calabash_report.html',
            reportSuiteAsScenarios: true,
            scenarioTimestamp: true,
            launchReport: false,
            metadata: {
                "App Name": appName,
                "Test Environment": "STAGING",
                "Browser": "Chrome  54.0.2840.98",
                "Platform": "Windows 10",
                "Parallel": "Scenarios",
                "Executed": "Remote"
            }
        };

        reporter.generate(options);


        const report = fs.readFileSync(
            path.join(__dirname, '../reports/calabash_report.html')
        );
        s3.upload(
            {
                Bucket: 'miso-4208-grupo3/results/' + message.id_estrategia + '/' + message.id_prueba + '/' + message.id_ejecucion,
                Key: 'calabash_report.html',
                Body: report,
                ContentType: "text/html"
            },
            async (err, data) => {
                if (err) console.log(err, err.stack);
                console.log('File uploaded successfully ' + data.Location);
                await persist({id_ejecucion: idEjecucion, ruta_archivo: data.Location});
                resolve('OK');
            });
    });
}


async function uploadReport(idEjecucion) {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        const report = fs.readFileSync(
            path.join(__dirname, '../reports/cucumber-report.html')
        );
        s3.upload(
            {
                Bucket: 'miso-4208-grupo3/results/bdt',
                Key: 'cucumber-report.html',
                Body: report
            },
            async (err, data) => {
                if (err) console.log(err, err.stack);

                console.log('File uploaded successfully ' + data.Location);
                await persist({id_ejecucion: idEjecucion, ruta_archivo: data.Location});
                resolve('OK');
            });
    });
}


async function uploadFile(file, fileName, message) {
    const s3 = new AWS.S3();
    //Setting up S3 upload parameters
    const params = {
        Bucket: 'miso-4208-grupo3/app',
        Key: fileName+'.apk',
        Body: file,
    };
    await s3.upload(params, async (err, data) => {
        if (err) {
            return err;
        }
        console.log('File uploaded successfully ' + data.Location);
        Version.create({id_app: message.id_app, ruta_app: data.Location, descripcion:fileName},{raw: true})
    });
}

//Persist results
async function persist(fields) {
    await Result.create(fields, {raw: true});
}

//Starting the server
task.start();
app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});
