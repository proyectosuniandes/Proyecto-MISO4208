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
    const redirect = useRedirect();
    let history = useHistory();
    const approve = () => {

        //const {record} = this.props;
        console.log(util.inspect(record, false, null, true /* enable colors */))
        console.log(record.id_estrategia)

        //const urlRest = `http://localhost:8080/strategies/execute/` + record.id_estrategia;
        const urlRest = `http://3.86.81.190:8080/strategies/execute/` + record.id_estrategia;

        console.log(urlRest);

        fetch(urlRest, {
            method: 'GET'
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log('data = ', data);
            })
            .catch(function (err) {
                console.error(err);
            });

        notify('Estategia : ' + record.nombre + ' Lanzada para su Ejecución');
        redirect('/#/executions/');

    };

    return <Button label="Ejecutar" variant="outlined"
                   color="primary" onClick={approve}/>;
};

export default ExecuteButton;