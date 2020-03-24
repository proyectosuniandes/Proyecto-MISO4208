'use strict'
const shell = require('shelljs');
const fs = require('fs');
const s3 = require('../../sqs/s3Storage.js')

module.exports.generateCypress = function(req,success,error){

    let ejecucion = req.ejecucion_ID;
    let prueba = req.prueba_ID;
    let estrategia = req.estrategia_ID;
    let script = req.script;

    s3.getFileFromS3(estrategia,prueba,ejecucion,script);
    
    updateBD(ejecucion);
    
    shell.exec('npx cypress run', function(val, stdout, stderr) {
        fs.readdir(`../cypress/results`,function(err, items) {
            let file;
            for(i=0;i<items.length;i++){
                if(items[i].includes('html')){
                   file = items[i];
                   break;
                }
            }
            const content = fs.readFileSync(`../cypress/results/${file}`);
            s3.saveFileToS3(estrategia,prueba,ejecucion,content,()=>{ 
                for(i=0;i<items.length;i++){
                    if(items[i].includes('html')){
                        fs.unlinkSync(`../cypress/results/${items[i]}`);
                    }
                }
            });
        });
        success("ok");
    });

    updateBD = (ejecucion)=>{
        Execution.update({
          estado: 2
        },{
          where: {id_ejecucion: ejecucion}
        }).then(u=>{
          console.log("Ejecución id:" +ejecucion+" Pending.");
        });
    }
    
}   
