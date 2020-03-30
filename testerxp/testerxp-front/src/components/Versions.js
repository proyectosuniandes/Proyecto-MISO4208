import React from 'react';
import { Typography } from '@material-ui/core';
import UrlFieldCmp from './UrlFieldCmp';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Box } from '@material-ui/core';

import {
    List,
    Create,
    Edit,
    Datagrid,
    TextField,
    EditButton,
    SimpleForm,
    TextInput,
    FileInput,
    ReferenceField,
    FileField,
    ReferenceInput,
    SelectInput,
    FormDataConsumer

} from 'react-admin';

export const VersionList = (props) => (
    <List {...props} title="Lista de Versiones" sort={{field: 'id_version', order: 'ASC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <ReferenceField source="id_app" reference="apps" label="Aplicación">
                <TextField source="nombre" />
            </ReferenceField>
            <ReferenceField source="id_app" reference="apps" label="Tipo Aplicación">
                <TextField source="tipo_app" />
            </ReferenceField>
            <TextField source="descripcion" label="Versión"/>
            <UrlFieldCmp source="ruta_app"  label="Ruta Aplicación"/>
            <EditButton label="Editar"/>
        </Datagrid>
    </List>
);

export const VersionEdit = props => (
    <Edit {...props}>
        <SimpleForm>


            <TextInput disabled source="id_version"/>
            <ReferenceField source="id_app" reference="apps" label="Aplicación">
                <TextField source="nombre"/>
            </ReferenceField>

            <TextInput source="descripcion" label="Versión"/>


            <FormDataConsumer>
                {({ formData, ...rest }) => formData.id_app === 1 &&
                    <TextInput source="email" {...rest} />
                }
            </FormDataConsumer>

            <TextInput source="ruta_app" label="Ruta Aplicación"  fullWidth/>

            <FileInput source="files" label="Archivo Aplicación Móvil">
                <FileField source="ruta_app" title="Ruta Aplicación" />
            </FileInput>

        </SimpleForm>
    </Edit>
);


export const VersionCreate = props => (
    <Create {...props}>
        <SimpleForm>

            <Box p="1em">
                <Box display="flex">
                    <Box flex={2} mr="1em">

                        <Typography variant="h6" gutterBottom>Version de Aplicación</Typography>
                     {/*   <ReferenceField source="id_app" reference="apps" label="Aplicación">
                            <TextField source="nombre"/>
                        </ReferenceField>*/}
                        <Box display="flex">
                            <Box flex={1} mr="1em">
                                <TextInput disabled source="id_version"/>
                                <TextInput source="id_app"/>
                                <TextField source="descripcion" label="Versión"/>
                                <UrlFieldCmp source="ruta_app"  label="Ruta Aplicación"/>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

        </SimpleForm>
    </Create>
);