import React from "react";
import {Create, SelectInput, SimpleForm, TextInput} from "react-admin";
import {Box, Typography} from "@material-ui/core";
import {Card} from 'primereact/card';

const ApplicationCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <Card style={{width: '100%'}}>
                <Typography variant="h6" gutterBottom>Aplicación <hr/></Typography>
                <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                    <Box p={1} width="50%">
                        <TextInput source="nombre" resource="apps" fullWidth/>
                    </Box>
                    <Box p={1} width="50%">
                        <SelectInput label="Tipo Aplicación" resource="apps" fullWidth  source="tipo_app" choices={[
                            {id: 'web', name: 'Web'},
                            {id: 'movil', name: 'Móvil'},]}/>
                    </Box>

                </Box>
            </Card>




        </SimpleForm>
    </Create>
);

export default ApplicationCreate;