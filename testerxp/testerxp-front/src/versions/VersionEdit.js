import React from "react";
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {
    Edit,
    FileField,
    FileInput,
    FormDataConsumer,
    SimpleForm,
    TextInput
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

const VersionEdit = (props: any) => {
    const classes = useStyles();
    return (

        <Edit {...props}>
            <SimpleForm>

                <Typography variant="h6" gutterBottom>
                    Aplicación
                </Typography>
                <Box mt="1em"/>
                <TextInput disabled source="app.nombre" formClassName={classes.izq} label="Nombre"/>
                <TextInput disabled source="app.tipo_app" label="Tipo" formClassName={classes.der}/>
                <Box mt="1em"/>
                <Typography variant="h6" gutterBottom>
                    Versión
                </Typography>

                <Box mt="1em"/>

                <TextInput disabled source="id_version" formClassName={classes.izq} label="ID"/>
                <TextInput source="descripcion" label="Versión Aplicación" formClassName={classes.der}/>


                <FormDataConsumer fullWidth>
                    {({formData, ...rest}) => formData['app.tipo_app'] === 'web' &&
                        <TextInput source="ruta_app" {...rest} label="Ruta Aplicación" fullWidth/>
                    }
                </FormDataConsumer>


                <Box mt="1em"/>

                <FormDataConsumer>
                    {({formData, ...rest}) => formData['app.tipo_app'] === 'movil' &&
                        <FileInput source="files" {...rest} label="Archivo Aplicación Móvil">
                            <FileField source="ruta_app" title="Ruta"/>
                        </FileInput>
                    }
                </FormDataConsumer>


            </SimpleForm>
        </Edit>
    );
};


export default VersionEdit;