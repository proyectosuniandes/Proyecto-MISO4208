import React from "react";
import {Datagrid, List, TextField} from "react-admin";

const ExecutionList = (props) => (
    <List {...props} title="Lista de Ejecuciones" >
        <Datagrid>
            <TextField source="id"/>
            {/*<ReferenceField source="id_estrategia" reference="strategies" label="Estrategia" >
                <TextField source="nombre" />
            </ReferenceField>
            <ReferenceField source="id_prueba" reference="strategyTests" label="Tipo Aplicación" >
                <TextField source="tipo_app" />
            </ReferenceField>*/}
            <TextField source="id_estrategia" label="id Estrategia"/>
            <TextField source="id_prueba" label="id prueba"/>
            <TextField source="estado" label="Estado"/>
            <TextField source="fecha_inicio" label="Fecha Inicio"/>
        </Datagrid>
    </List>
);

export default ExecutionList;