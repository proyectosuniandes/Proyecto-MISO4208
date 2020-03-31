import React from "react";
import {Create, SelectInput, SimpleForm, TextInput} from "react-admin";
import {Box, Typography} from "@material-ui/core";


const ApplicationCreate = props => (
    <Create {...props}>
        <SimpleForm>

            <Box p="1em">
                <Box display="flex">
                    <Box flex={2} mr="1em">
                        <Typography variant="h6" gutterBottom>Aplicación</Typography>
                        <Box mt="1em"/>

                        <Box display="flex">
                            <Box flex={2} mr="1em">
                                <TextInput source="nombre" resource="apps" fullWidth/>
                            </Box>

                        </Box>
                        <SelectInput label="Tipo Aplicación" resource="apps"  source="tipo_app" choices={[
                            {id: 'web', name: 'Web'},
                            {id: 'movil', name: 'Móvil'},]}/>
                        <Box mt="1em" />
                    </Box>
                </Box>
            </Box>

        </SimpleForm>
    </Create>
);

export default ApplicationCreate;