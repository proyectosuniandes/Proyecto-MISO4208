import React from "react";
import {
    Create,
    FileField,
    FileInput,
    FormDataConsumer,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput
} from "react-admin";


import {Box, Typography} from "@material-ui/core";
import {Card} from 'primereact/card';
import TypeAppCmp from "../components/data/TypeAppCmp";


const VersionCreate = (props: any) => {

    return (

        <Create {...props}>
            <SimpleForm>

                <Card style={{width: '100%'}}>
                    <Typography variant="h6" gutterBottom> Aplicación <hr/></Typography>
                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="50%">
                            <ReferenceInput label="Nombre" source="id_app" reference="apps"
                                            sort={{field: 'id_app', order: 'ASC'}}>
                                <SelectInput optionText="nombre" fullWidth/>
                            </ReferenceInput>
                        </Box>
                        <Box p={1} width="50%">


                            <FormDataConsumer>
                                {formDataProps => (
                                    <TypeAppCmp {...formDataProps} />
                                )}
                            </FormDataConsumer>

                        </Box>

                    </Box>

                </Card>

                <br/>
                <Card style={{width: '100%'}}>
                    <Typography variant="h6" gutterBottom> Versión <hr/></Typography>

                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="50%">
                            <TextInput source="descripcion" label="Versión Aplicación"/>
                        </Box>
                        <Box p={1} width="50%">

                        </Box>

                    </Box>

                    <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                        <Box p={1} width="100%">

                            <FormDataConsumer fullWidth>
                                {({formData, ...rest}) => formData.tipo_app === 'web' &&
                                    <TextInput source="ruta_app" {...rest} label="Ruta Aplicación"/>
                                }
                            </FormDataConsumer>

                            <FormDataConsumer>
                                {({formData, ...rest}) =>  formData.tipo_app === 'movil' &&
                                    <FileInput source="files" {...rest} label="Archivo Aplicación Móvil">
                                        <FileField source="ruta_app" {...rest} title="Ruta"/>
                                    </FileInput>
                                }
                            </FormDataConsumer>

                        </Box>

                    </Box>


                </Card>


            </SimpleForm>
        </Create>
    );
};

export default VersionCreate;