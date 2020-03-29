import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button'

import {
    showNotification, CREATE,
    withDataProvider,
} from 'react-admin';
import {push} from 'react-router-redux';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';

const util = require('util');

class ExecuteButton extends Component {
    handleClick = () => {
        const {push, record, showNotification} = this.props;

        console.log(util.inspect(record, false, null, true /* enable colors */))


        const updatedRecord = {prueba: 3, estado: 1, fecha_inicio: new Date()};

        fetch(`http://localhost:8080/historicalTests`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body: JSON.stringify(updatedRecord)
        }).then(() => {
                showNotification('Estrategia de Prueba Ejecutada');
                push('/historicalTests');
            }).catch((e) => {
                showNotification('Error: Estrategia No Ejecutada', 'warning')
            });


        const updatedRecord1 = {prueba: 1, estado: 1, fecha_inicio: new Date()};

        fetch(`http://localhost:8080/historicalTests`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body: JSON.stringify(updatedRecord1)
        }).then(() => {
            showNotification('Estrategia de Prueba Ejecutada');
            push('/historicalTests');
        }).catch((e) => {
            showNotification('Error: Estrategia No Ejecutada', 'warning')
        });

    };

    render() {
        return <Button color="primary" onClick={this.handleClick}>Ejecutar</Button>;
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

