import React from 'react';
import {Datagrid, EditButton, List, TextField} from "react-admin";


const ApplicationList = (props) => (
    <List {...props} title="Lista de Aplicaciones" sort={{field: 'id_app', order: 'ASC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <TextField source="nombre" label="Aplicación"/>
            <TextField source="tipo_app" label="Tipo Aplicación"/>
            <EditButton label="Editar"/>
        </Datagrid>
    </List>
);

export default ApplicationList;