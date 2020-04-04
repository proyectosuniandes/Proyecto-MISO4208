import React from "react";
import {Datagrid, EditButton, List, ReferenceField, TextField} from "react-admin";
import UrlFieldCmp from "../components/UrlFieldCmp";

const ExecutionList = (props) => (
    <List {...props} title="Lista de Ejecuciones" >
        <Datagrid>
            <TextField source="id"/>
            <ReferenceField source="id_app" reference="apps" label="Aplicación" >
                <TextField source="nombre" />
            </ReferenceField>
            <ReferenceField source="id_app" reference="apps" label="Tipo Aplicación" >
                <TextField source="tipo_app" />
            </ReferenceField>
            <TextField source="descripcion" label="Versión"/>
            <UrlFieldCmp source="ruta_app"  label="Ruta Aplicación"/>
            <EditButton label="Editar"/>
        </Datagrid>
    </List>
);

export default ExecutionList;