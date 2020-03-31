import React from "react";
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {
    Create,
    SelectInput,
    SimpleForm,

} from "react-admin";

import {Box, Typography} from '@material-ui/core';

import {makeStyles, Theme} from '@material-ui/core/styles';
import {Styles} from '@material-ui/styles/withStyles';

export const styles: Styles<Theme, any> = {
    izq: {display: 'inline-block'},
    der: {display: 'inline-block', marginLeft: 32},
    ruta: {width: 800},
};
const useStyles = makeStyles(styles);

const StrategyCreate = (props: any) => {
    const classes = useStyles();
    return (

        <Create {...props}>
            <SimpleForm>

                <Box p="1em">
                    <Box display="flex">
                        <Box flex={2} mr="1em">
                            <Typography variant="h6" gutterBottom>Aplicación</Typography>
                            <Box mt="1em"/>

                            <Box display="flex">
                                <Box flex={2} mr="1em">

                                </Box>

                            </Box>
                            <SelectInput label="Tipo Aplicación" resource="apps" source="tipo_app" choices={[
                                {id: 'web', name: 'Web'},
                                {id: 'movil', name: 'Móvil'},]}/>
                            <Box mt="1em"/>
                        </Box>
                    </Box>
                </Box>

            </SimpleForm>
        </Create>
    );
};


export default StrategyCreate;