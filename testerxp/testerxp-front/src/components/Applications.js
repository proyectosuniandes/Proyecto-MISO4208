import React from 'react';


import {
    List, Create, Edit, Datagrid, TextField, EditButton, SimpleForm, TextInput
} from 'react-admin';

export const ApplicationList = (props) => (
    <List {...props} title="Lista de Aplicaciones" sort={{ field: 'id_app', order: 'ASC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="nombre"  label="Aplicación"/>
            <TextField source="tipo_app"  label="Tipo Aplicación"/>
            <EditButton label="Editar"/>
        </Datagrid>
    </List>
);

export const ApplicationEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput disabled  source="id"/>
            <TextInput source="nombre" />
        </SimpleForm>
    </Edit>
);


export const ApplicationCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="nombre"/>
        </SimpleForm>
    </Create>
);