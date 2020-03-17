import React from 'react';
import Button from '@material-ui/core/Button';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import IconEvent from '@material-ui/icons/Event';
import { ExpandMore, ExpandLess } from "@material-ui/icons";

import {
    List,
    Datagrid,
    TextField,
    ReferenceManyField,
    SingleFieldList,
    ChipField, EditButton


} from 'react-admin';

export const TestList = (props) => (
    <List {...props} title="Estrategias de Prueba" sort={{field: 'id_app', order: 'ASC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"  label="No. Estrategia"/>
            <TextField source="nombre" label="Aplicación"/>
            <TextField source="tipo_apps.descripcion" label="Tipo Aplicación"/>

            <ReferenceManyField label="Tipo de Pruebas" reference="test" target="app"
                                sort={{field: 'id_prueba', order: 'ASC'}}>
                <SingleFieldList>
                    <ChipField source="tipo_pruebas.descripcion"/>
                </SingleFieldList>
            </ReferenceManyField>
            {/*<EditButton/>*/}
            <Button   color="primary" key="Ejecutar" onClick={() => { alert('Estrategia de Pruebas Ejecutandose ....');}}>
                Ejecutar
            </Button>
        </Datagrid>
    </List>
);

