import React from "react";
import {
    Create,
    FormDataConsumer,
    ReferenceInput,
    SelectArrayInput,
    SelectInput,
    SimpleForm,
    TextInput
} from "react-admin";
import {Box, Typography} from "@material-ui/core";
import {Card} from 'primereact/card';
import TypeAppCmp from "../components/data/TypeAppCmp";

const MutationCreate = (props: any) => {

    return (
        <Create {...props}>
            <SimpleForm basePath="/test">
                <div style={{width: '100%'}}>
                    <Card style={{width: '100%'}}>
                        <Typography variant="h6" gutterBottom>Mutación de Aplicaciones <hr/></Typography>
                        <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                            <Box p={1} width="33%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => {
                                        if (formData.id_app !== undefined) {
                                            var t = formData.id_app;
                                            var idApp = t.toString();

                                        }
                                        return (

                                            <ReferenceInput label="Nombre"
                                                            basepath="/apps"
                                                            filter={{ tipo_app: 'movil' }}
                                                            source="id_app"
                                                            reference="apps"
                                                            sort={{field: 'id_app', order: 'ASC'}}>


                                                <SelectInput optionText="nombre" fullWidth
                                                             disabled={!!formData.id_app}/>

                                            </ReferenceInput>


                                        )
                                    }}
                                </FormDataConsumer>


                            </Box>

                            <Box p={1} width="33%">
                                <FormDataConsumer>
                                    {formDataProps => (
                                        <TypeAppCmp {...formDataProps} />
                                    )}
                                </FormDataConsumer>
                            </Box>
                            <Box p={1} width="33%">

                                <FormDataConsumer>
                                    {({formData, ...rest}) => {

                                        if (formData.id_app !== undefined) {
                                            var t = formData.id_app;
                                            var idApp = t.toString();
                                            console.log(idApp)

                                            return (
                                                <ReferenceInput label="Versión"
                                                                source="version_app"
                                                                reference="versions"
                                                                filter={{id_app: formData.id_app}}
                                                                sort={{field: 'id_app', order: 'ASC'}} {...rest}>
                                                    <SelectInput optionText="descripcion" fullWidth/>
                                                </ReferenceInput>
                                            )
                                        }

                                    }}
                                </FormDataConsumer>





                            </Box>
                        </Box>

                        <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                            <Box p={1} width="100%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => formData.tipo_app === 'movil' && formData.version_app &&
                                        <TextInput source="paquete" label="Paquete" fullWidth/>}
                                </FormDataConsumer>
                            </Box>
                            {/*<Box p={1} width="50%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => formData.tipo_app === 'movil' &&
                                        <TextInput source="cantidad" label="Cantidad" fullWidth/>}
                                </FormDataConsumer>
                            </Box>*/}
                        </Box>


                        <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">

                            <FormDataConsumer>
                                {({formData, ...rest}) => formData.tipo_app === 'movil' &&
                                    <Card style={{width: '100%'}}>
                                        <Typography variant="h6" gutterBottom>Operadores
                                            <hr/>
                                        </Typography>
                                        <SelectArrayInput label="Operadores" source="operadores" fullWidth choices={[
                                            {id: '1', name: 'ActivityNotDefined'},
                                            {id: '2', name: 'DifferentActivityIntentDefinition'},
                                            {id: '3', name: 'InvalidActivityName'},
                                            {id: '4', name: 'InvalidKeyIntentPutExtra'},
                                            {id: '5', name: 'InvalidLabel'},
                                            {id: '6', name: 'NullIntent'},
                                            {id: '7', name: 'NullValueIntentPutExtra'},
                                            {id: '8', name: 'WrongMainActivity'},
                                            {id: '9', name: 'MissingPermissionManifest'},
                                            {id: '10', name: 'WrongStringResource'},
                                        ]}/>

                                    </Card>

                                }
                            </FormDataConsumer>
                        </Box>
                    </Card>
                </div>
            </SimpleForm>
        </Create>
    );
};

export default MutationCreate;