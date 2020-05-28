import simpleRestProvider from 'ra-data-simple-rest';

const util = require('util');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: "AKIA6FD2VJYWCU5ZVJEO",
    secretAccessKey: "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",
    "region": 'us-east-1'
}); // for simplicity. In prod, use loadConfigFromFile, or env variables



//const dataProvider = simpleRestProvider('http://localhost:8080');
const dataProvider = simpleRestProvider('http://3.86.81.190:8080');

function read(reader, prueba, file) {
    return new Promise(resolve => {
        reader.onload = () => {
            resolve({
                prueba: prueba,
                base64File: reader.result.split(',')[1],
                name: file.rawFile.name,
                mimeType: file.rawFile.type,
                size: file.rawFile.size,
                lastModified: file.rawFile.lastModified,
            })
        };

    });
}

async function filesUpload(params) {

    console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));

    var fileList = [];

    if (params.data.filesE2E) {
        var readerE2E = new FileReader();
        await readerE2E.readAsDataURL(params.data.filesE2E.rawFile);
        console.log(params.data.filesE2E);
        fileList.push(await read(readerE2E, 'E2E', params.data.filesE2E));
    }

    if (params.data.filesRANDOM) {
        var readerRANDOM = new FileReader();
        await readerRANDOM.readAsDataURL(params.data.filesRANDOM.rawFile);
        console.log(params.data.filesRANDOM);
        fileList.push(await read(readerRANDOM, 'RANDOM', params.data.filesRANDOM));
    }


    if (params.data.filesBDT) {

        if ((params.data.filesBDT).length) {
            var fileListBDT = [];
            for (var i = 0; i < (params.data.filesBDT).length; i++) {
                console.log((params.data.filesBDT)[i])
                var readerBDT = new FileReader();
                await readerBDT.readAsDataURL(((params.data.filesBDT)[i]).rawFile);
                console.log(((params.data.filesBDT)[i]));
                fileListBDT.push(await read(readerBDT, 'BDT', ((params.data.filesBDT)[i])));
            }
            fileList.push(fileListBDT);
        } else {
            var readerBDTOne = new FileReader();
            await readerBDTOne.readAsDataURL(params.data.filesBDT.rawFile);
            console.log(params.data.filesBDT);
            fileList.push(await read(readerBDTOne, 'BDT', params.data.filesBDT));
        }

    }


    return fileList;
}

const DataProvideUpload = {
    ...dataProvider,
    update: (resource, params) => {

        if (resource === 'versions' && params.data.files) {

            console.log('resource :' + resource);
            console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(params.data.files.rawFile);
                console.log(params.data.files)
                //reader.onload = () => resolve(reader.result);
                reader.onload = () => {
                    resolve({
                        base64File: reader.result.split(',')[1],
                        name: params.data.files.rawFile.name,
                        mimeType: params.data.files.rawFile.type,
                        size: params.data.files.rawFile.size,
                        lastModified: params.data.files.rawFile.lastModified,
                    });
                };
                reader.onerror = reject;
            }).then(file =>
                dataProvider.update(resource, {
                    ...params,
                    data: {
                        ...params.data,
                        files: file,
                    },
                })
            );

        } else {
            console.log('resource :' + resource);
            console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));
            return dataProvider.update(resource, params);
        }
    },
    create: async (resource, params) => {

        if (resource === 'strategies') {
            console.log('resource :' + resource);
            //-- Se envia la estrategia
            if (params.data.filesE2E || params.data.filesRANDOM || params.data.filesBDT) {
                return new Promise((resolve) => {
                    resolve(filesUpload(params))
                }).then(fileList =>
                    dataProvider.create(resource, {
                        ...params,
                        data: {
                            ...params.data,
                            files: fileList,
                        },
                    })
                );

            }

        } else if (resource === 'versions') {

            console.log('resource :' + resource);
            console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));

            if (params.data.files) {

                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(params.data.files.rawFile);
                    console.log(params.data.files)
                    reader.onload = () => {
                        resolve({
                            base64File: reader.result.split(',')[1],
                            name: params.data.files.rawFile.name,
                            mimeType: params.data.files.rawFile.type,
                            size: params.data.files.rawFile.size,
                            lastModified: params.data.files.rawFile.lastModified,
                        });
                    };
                    reader.onerror = reject;
                }).then(file =>
                    dataProvider.create(resource, {
                        ...params,
                        data: {
                            ...params.data,
                            files: file,
                        },
                    })
                );

            }

        } else if (resource === 'mutation') {

            //const queueURL = 'https://sqs.us-east-1.amazonaws.com/973067341356/bdt.fifo';
            console.log('resource :' + resource);
            console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));

            if (params.data) {

                var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

                const sendParams = {
                    MessageBody: JSON.stringify({
                        id_app: params.data.id_app,
                        tipo_prueba: 'MUTANTE',
                        version_app: params.data.version_app,
                        paquete: params.data.paquete,
                        operadores: params.data.operadores,
                    }),
                    MessageDeduplicationId: ""+params.data.version_app,  // Required for FIFO queues
                    MessageGroupId: ""+params.data.id_app,  // Required for FIFO queues
                    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/973067341356/bdt.fifo' //'https://sqs.us-east-1.amazonaws.com/973067341356/dispatcher.fifo',
                };

                await sqs.sendMessage(sendParams, function (err, data) {
                    if (err) {
                        console.log('Error', err);
                    } else {
                        console.log("Success", data.MessageId);
                    }
                });
                alert(' Mutaciones Enviadas para su Generacion ...');
                return true;
            }

        }

        console.log('resource :' + resource);
        console.log('params : ' + util.inspect(params, false, null, true /*enable colors */));
        return dataProvider.create(resource, params);

    },
}


export default DataProvideUpload;
