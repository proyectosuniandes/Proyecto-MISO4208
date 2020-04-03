import React, {Fragment} from "react";
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {
    Edit,
    FileField,
    FileInput,
    FormDataConsumer, ReferenceInput, SelectInput,
    SimpleForm,
    TextInput
} from "react-admin";

import {Box, Typography} from '@material-ui/core';

import {makeStyles, Theme} from '@material-ui/core/styles';
import {Styles} from '@material-ui/styles/withStyles';
import {Card} from "primereact/card";
import TypeAppCmp from "../components/data/TypeAppCmp";

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


                <Card style={{width: '100%'}}>
                    <Typography variant="h6" gutterBottom> Aplicación <hr/></Typography>
                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="50%">
                            <TextInput disabled source="app.nombre" label="Nombre" fullWidth/>
                        </Box>
                        <Box p={1} width="50%">

                            <TextInput disabled source="app.tipo_app" label="Tipo" fullWidth/>

                        </Box>

                    </Box>

                </Card>

                <br/>
                <Card style={{width: '100%'}}>
                    <Typography variant="h6" gutterBottom> Versión <hr/></Typography>


                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="50%">
                            <TextInput disabled source="id_version" label="ID" fullWidth/>
                        </Box>
                        <Box p={1} width="50%">
                            <TextInput source="descripcion" label="Versión Aplicación" fullWidth/>
                        </Box>
                    </Box>

                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="100%">

                            <FormDataConsumer fullWidth>
                                {({formData, ...rest}) => formData['app.tipo_app'] === 'web' && <Fragment>

                                    <Typography variant="h6" gutterBottom> URL Web <hr/></Typography>
                                    <TextInput source="ruta_app" {...rest} label="Ruta Aplicación" fullWidth/>
                                </Fragment>

                                }
                            </FormDataConsumer>

                            <FormDataConsumer>
                                {({formData, ...rest}) => formData['app.tipo_app'] === 'movil' && <Fragment>
                                    <Typography variant="h6" gutterBottom> Ruta APK <hr/></Typography>
                                    <TextInput source="ruta_app" {...rest} label="Ruta Aplicación" fullWidth disabled/>
                                    <hr/>
                                    <br/>
                                    <FileInput source="files" {...rest} label="Archivo Aplicación Móvil">
                                        <FileField source="ruta_app" title="Ruta"/>
                                    </FileInput>
                                </Fragment>
                                }
                            </FormDataConsumer>

                        </Box>

                    </Box>


                </Card>


            </SimpleForm>
        </Edit>
    );
};


export default VersionEdit;