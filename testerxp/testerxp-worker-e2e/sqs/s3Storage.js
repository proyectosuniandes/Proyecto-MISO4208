var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.ACCES_KEY_ID_S3,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});
const bucketname= 'miso-4208-grupo3' //CAMBIAR POR NOMBRE DE BUCKET DE ACUERDO A TIPO DE PRUEBA

module.exports.saveFileToS3 = (estrategia,prueba,ejecucion, file, success) => {
  console.log("key: ", ejecucion);
  console.log("Bucket name: ", bucketname);
  console.log("CORS del bucket :",s3.getBucketCors.data);
    if(!s3.getBucketCors.data){
      configureCors(bucketname);
    }
    let params = {
      Bucket: `${bucketname}/results/${estrategia}/${prueba}/${ejecucion}`,
      Key: ejecucion,
      Body: `<pre>${file}<pre>`,
      CacheControl:"max-age=0,no-cache,no-store,must-revalidate",
      ContentType:"text/html",
      ACL:"public-read"
    };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err);
        success(err);
        return 0;
      }
      insertUrlReport(ejecucion,`https://${bucketname}.s3.amazonaws.com/results/${estrategia}/${prueba}/${ejecucion}`);
      console.log('HTML creado exitosamente: '+`https://${bucketname}.s3.amazonaws.com/results/${estrategia}/${prueba}/${ejecucion}.html`);
      success();
    });
    listBucketKeys(ejecucion);
}

module.exports.getFileFromS3 = (estrategia, prueba, ejecucion, file, success) => {
  let params ={
    Bucket: `${bucketname}/script/${estrategia}/${prueba}/${ejecucion}`,
    Key: file
  }
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync(
      path.join(__dirname, '../cypress/integration', script),
      data.Body.toString()
    );
    console.log(script + ' has been created!');
    success();
  });
}

insertUrlReport = (code,url_report)=>{
  Execution.insert({
    id_ejecucion: code,
    ruta_archivo: url_report
  }).then(u=>{
    console.log("Resultado ejecución:" +code+" " +url_report);
  });
}

const configureCors = (bucket)=>{
  var params = {
    Bucket: bucket,
    CORSConfiguration: {
     CORSRules: [
        {
       AllowedHeaders: [
          "*"
       ],
       AllowedMethods: [
          "PUT",
          "POST",
          "DELETE"
       ],
       AllowedOrigins: [
          "*"
       ],
       ExposeHeaders: [
          "x-amz-server-side-encryption"
       ],
       MaxAgeSeconds: 3000
      },
        {
       AllowedHeaders: [
          "Authorization"
       ],
       AllowedMethods: [
          "GET"
       ],
       AllowedOrigins: [
          "*"
       ],
       MaxAgeSeconds: 3000
      }
     ]
    },
    ContentMD5: ""
   };
   s3.putBucketCors(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     //else     console.log(data);           // successful response
   });

}

const listBucketKeys = (key)=>{
  var split = key.split('/');
  var raiz = split[0];
  console.log("directorio raiz: ", raiz);
  let params={
    Bucket: bucketname,
    Prefix: raiz,
  }
  s3.listObjectsV2(params,function(err,data){
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}