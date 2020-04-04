import simpleRestProvider from 'ra-data-simple-rest';

const util = require('util');
//const dataProvider = simpleRestProvider('http://localhost:8080');
const dataProvider = simpleRestProvider('http://3.95.244.7:8080');


const DataProvideUpload = {
        ...dataProvider,
        create: (resource, params) => {
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
                    dataProvider.create( resource, {
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
                return dataProvider.create(resource, params);
            }
        },
    }
;

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of data provider decoration.
 */
const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file.rawFile);
    });

export default DataProvideUpload;
