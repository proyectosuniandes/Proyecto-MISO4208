import React from "react";
import {Edit, SelectInput, SimpleForm, TextInput} from "react-admin";
import {Box, Typography} from '@material-ui/core';

const ApplicationEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <Typography variant="h6" gutterBottom>Aplicación</Typography>
            <Box mt="1em"/>
            <TextInput disabled source="id"/>
            <TextInput source="nombre"/>
            <SelectInput label="Tipo Aplicación" source="tipo_app" choices={[
                {id: 'web', name: 'Web'},
                {id: 'movil', name: 'Móvil'},]}/>
        </SimpleForm>
    </Edit>
);

export default ApplicationEdit;