import React from 'react';
import ExecuteButton from './buttons/ExecuteStrategyButton.js';


import {
    List,
    Datagrid,
    TextField,
    ReferenceManyField,
    SingleFieldList,
    ChipField


} from 'react-admin';

export const TestList = (props) => (
    <List {...props} title="Estrategias de Prueba" sort={{field: 'id_app', order: 'ASC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"  label="No. Estrategia"/>
            <TextField source="nombre" label="Aplicación"/>
            <TextField source="tipo_apps.descripcion" label="Tipo Aplicación"/>
            <ReferenceManyField label="Tipo de Pruebas"
                                reference="tests"
                                target="app"
                                sort={{field: 'id_prueba', order: 'ASC'}}>
                <SingleFieldList>
                    <ChipField source="tipo_pruebas.descripcion"/>
                </SingleFieldList>
            </ReferenceManyField>
            <ExecuteButton />
        </Datagrid>
    </List>
);

