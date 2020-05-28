import React from 'react';
import {useNotify, useRedirect, Button} from 'react-admin';
import {useHistory} from 'react-router-dom';
import {
    BrowserRouter as Router, Route,
    Redirect, Switch
} from 'react-router-dom';

const util = require('util');

const ExecuteButton = ({record}) => {
    const notify = useNotify();
    const approve = () => {

        //const {record} = this.props;
        console.log(util.inspect(record, false, null, true /* enable colors */))
        console.log('idEstrategia :' + record.id_estrategia)

        //const urlRest = 'http://localhost:8080/strategies/execute/' + record.id_estrategia;
        const urlRest = 'http://3.86.81.190:8080/strategies/execute/' + record.id_estrategia;

        console.log(urlRest);

        fetch(urlRest, {
            method: 'GET'
        })
            .then(function (response) {
                console.log(util.inspect(response, false, null, true /* enable colors */))
                if(response.ok) {
                    window.location.hash = "/executions";
                    //return response;

                }
            })
            .then(function (data) {
                console.log('data = ', data);
            })
            .catch(function (err) {
                console.error(err);
            });

        notify('Estategia : ' + record.nombre + ' Lanzada para su Ejecución');


    };

    return <Button label="Resultados" variant="outlined"
                   color="primary" onClick={approve}/>;
};

export default ExecuteButton;