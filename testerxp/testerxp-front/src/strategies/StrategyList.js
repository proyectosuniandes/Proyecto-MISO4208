import React from "react";
import {ChipField, Datagrid, List, ReferenceManyField, SingleFieldList, TextField, UrlField} from "react-admin";

import NestedFieldApp from '../components/data/NestedFieldApp.js'
import NestedFieldVersion from '../components/data/NestedFieldVersion.js'


import ExecuteButton from '../components/buttons/ExecuteButton';

const StrategyList = (props) => (
    <List {...props} title="Lista de Estrategias de Prueba" sort={{field: 'id_estrategia', order: 'ASC'}}>

        <Datagrid rowClick="edit">

            <TextField source="id"/>

            <TextField source="nombre" label="Nombre Estrategia"/>

            <ReferenceManyField label="Tipo de Prueba"
                                reference="strategyTests"
                                target="id_estrategia"
                                sort={{field: 'id_prueba', order: 'ASC'}}>
                <SingleFieldList>
                    <ChipField source="prueba.tipo_prueba"/>
                </SingleFieldList>
            </ReferenceManyField>


           <NestedFieldApp label= "Aplicación"/>

           <NestedFieldVersion label="Versión"/>

            <TextField source="estado" label="Estado"/>
            <UrlField source="ruta_consolidado"  label="Ruta Resultado"/>


            <ExecuteButton/>

        </Datagrid>

    </List>
);


export default StrategyList;