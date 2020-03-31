import React from "react";
import {
    Datagrid,
    EditButton,
    List,
    ReferenceField,
    TextField,
    ReferenceManyField,
    SingleFieldList,
    ChipField,
    ReferenceFieldController
} from "react-admin";
import ExecuteButton from '../components/buttons/ExecuteStrategyButton.js';

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


            <ReferenceFieldController label="Aplicación" reference="strategyTests" source="id_estrategia"
                                      link={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/apps" resource="apps" reference="apps" source="prueba.id_app"
                                    record={referenceRecord || {}} link={false}>
                        <TextField source="nombre"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>

            <ReferenceFieldController label="Tipo Aplicación" reference="strategyTests" source="id_estrategia"
                                      link={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/apps" resource="apps" reference="apps" source="prueba.id_app"
                                    record={referenceRecord || {}} link={false}>
                        <TextField source="tipo_app"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>


            <ReferenceFieldController label="Versión" reference="strategyTests" source="id_estrategia" link={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/versions" resource="versions" reference="versions"
                                    source="prueba.id_version" record={referenceRecord || {}} link={false}>
                        <TextField source="descripcion"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>

           {/* <ReferenceFieldController label="Aplicación" reference="strategyTests" source="id_estrategia"
                                      linkType={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/apps" resource="apps" reference="apps" source="prueba.id_app"
                                    record={referenceRecord || {}} link={false}>
                        <TextField source="nombre"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>

            <ReferenceFieldController label="Tipo Aplicación" reference="strategyTests" source="id_estrategia"
                                      linkType={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/apps" resource="apps" reference="apps" source="prueba.id_app"
                                    record={referenceRecord || {}} link={false}>
                        <TextField source="tipo_app"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>

            <ReferenceFieldController label="Versión" reference="strategyTests" source="id_estrategia" link={false}>
                {({referenceRecord, ...props}) => (
                    <ReferenceField basePath="/versions" resource="versions" reference="versions"
                                    source="prueba.id_version" record={referenceRecord || {}} link={false}>
                        <TextField source="descripcion"/>
                    </ReferenceField>
                )}
            </ReferenceFieldController>
*/}
            <EditButton label="Editar"/>
            <ExecuteButton/>
        </Datagrid>
    </List>
);


export default StrategyList;