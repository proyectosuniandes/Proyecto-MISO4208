import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button'

import {
    showNotification,useNotify, useRedirect,
} from 'react-admin';
import {push} from 'react-router-redux';


const util = require('util');

class ExecuteButton extends Component {
    handleClick = () => {

        const {record} = this.props;
        console.log(util.inspect(record, false, null, true /* enable colors */))
        console.log(record.id_estrategia)

        const urlRest = `http://localhost:8080/strategies/execute/` + record.id_estrategia;
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

        const notify = useNotify();
        const redirect = useRedirect();

        redirect('/executions');
        notify('Estategia Lanzada para su Ejecución');

    };

    render() {
        return <Button variant="outlined"
                       color="primary"
                       size="small" onClick={this.handleClick}>Ejecutar</Button>;
    }
}

ExecuteButton.propTypes = {
    push: PropTypes.func,
    record: PropTypes.object,
    showNotification: PropTypes.func,

};

export default connect(null, {
    showNotification,
    push,
})(ExecuteButton);

