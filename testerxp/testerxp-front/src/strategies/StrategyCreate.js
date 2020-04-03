import React, {Fragment} from 'react';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {Card} from 'primereact/card';
import {Box, Typography} from "@material-ui/core";

import TypeAppCmp from '../components/data/TypeAppCmp'

import {
    BooleanInput,
    Create, Error,
    FileField,
    FileInput,
    FormDataConsumer, Loading, Query,
    ReferenceInput,
    SelectArrayInput,
    SelectInput,
    SimpleForm,
    Tab,
    TabbedShowLayout,
    TextInput
} from 'react-admin';

const util = require('util');
const StrategyCreate = (props: any) => {

    return (
        <Create {...props}>
            <SimpleForm>


                <div style={{width: '100%'}}>

                    <Card style={{width: '100%'}}>
                        <Typography variant="h6" gutterBottom>Estrategia de Pruebas <hr/></Typography>
                        <TextInput source="nom_estrategia" label="Nombre" fullWidth/>
                    </Card>

                    <br/>


                    <Card style={{width: '100%'}}>
                        <Typography variant="h6" gutterBottom>Aplicación <hr/></Typography>
                        <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                            <Box p={1} width="33%">


                                <FormDataConsumer>
                                    {({formData, ...rest}) => {
                                        console.log('formData  APP: ' + util.inspect(formData, true, null, true /*enable colors */));
                                        if (formData.id_app !== undefined) {
                                            var t = formData.id_app;
                                            var idApp = t.toString();
                                            console.log(idApp)
                                        }
                                        return (

                                            <ReferenceInput label="Nombre"
                                                            basepath="/apps"
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
                                        console.log('formData VERSION : ' + util.inspect(formData, true, null, true /*enable colors */));
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
                            <Box p={1} width="33%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => formData.id_app &&
                                        <SelectInput fullWidth source="modo" choices={[
                                            {id: 'headful', name: 'HeadFul'},
                                            {id: 'headless', name: 'HeadLess'},

                                        ]}/>}

                                </FormDataConsumer>

                            </Box>
                            <Box p={1} width="33%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => formData.id_app &&
                                        <BooleanInput label="VRT (Visual Regression Testing)" source="vrt" fullWidth/>
                                    }

                                </FormDataConsumer>
                            </Box>
                            <Box p={1} width="33%">
                                <FormDataConsumer>
                                    {({formData, ...rest}) => formData.id_app && formData.vrt &&
                                        <ReferenceInput label="Versión VRT"
                                                        source="version_vrt"
                                                        reference="versions" {...rest}
                                                        filter={{id_app: formData.id_app}}
                                                        sort={{field: 'id_app', order: 'ASC'}} {...rest}>
                                            <SelectInput optionText="descripcion" fullWidth/>
                                        </ReferenceInput>
                                    }
                                </FormDataConsumer>
                            </Box>
                        </Box>

                    </Card>

                    <br/>


                    <FormDataConsumer>
                        {({formData, ...rest}) => formData.tipo_app === 'web' &&
                            <Card style={{width: '100%'}}>
                                <Typography variant="h6" gutterBottom>Matriz de Navegadores <hr/></Typography>
                                <SelectArrayInput label="Versiones Firefox" source="firefox" fullWidth choices={[
                                    {id: '67', name: '67'},
                                    {id: '68', name: '68'},
                                ]}/>

                                <SelectArrayInput label="Versiones Google Chrome " source="chrome" fullWidth choices={[
                                    {id: '80', name: '80'},
                                    {id: '81', name: '81'},
                                ]}/>
                            </Card>

                        }
                    </FormDataConsumer>


                    <br/>

                    <FormDataConsumer>
                        {({formData, ...rest}) => formData.tipo_app === 'movil' &&
                            <Card style={{width: '100%'}}>
                                <Typography variant="h6" gutterBottom>Matriz de Dispositivos <hr/></Typography>
                                <SelectArrayInput label="Dispositivos" source="dispositivos" fullWidth choices={[
                                    {
                                        id: '5e4c60b3-327b-4fb4-98e2-4f996900e145',
                                        name: 'Custom Tablet  - Android: 4.4.4 - SCREEN: 1536 x 2048 dpi 320'

                                    },
                                    {
                                        id: 'b1e51193-4db8-43f7-b7cd-ae35eebb6bca',
                                        name: 'Custom Phone - Android: 4.4.4 - SCREEN: 1536 x 2048 dpi 320'
                                    },

                                    {
                                        id: '42b60b69-bd60-4c3d-912c-4073d854573d',
                                        name: 'Google Nexus 10 - Android:  4.4.4  - SCREEN: 2560 x 1600 dpi 320'
                                    },

                                    {
                                        id: 'de20111c-332a-4cb4-8088-d4a7f8f961ec',
                                        name: 'Samsung Galaxy Note 2 - Android: 4.4.4 - SCREEN: 720 x 1280 dpi 320'
                                    },

                                    {
                                        id: '5f6d4c94-d926-42cc-8019-f902295fc36d',
                                        name: 'Amazon Fire 7 - Android: 7.1.0 - SCREEN: 1024 x 600 dpi 160'
                                    },

                                    {
                                        id: 'e20da1a3-313c-434a-9d43-7268b12fee08',
                                        name: 'Samsung Galaxy S9 - Android: 9.0 - SCREEN: 1440 x 2960 dpi 560'
                                    },

                                    {
                                        id: '95c48908-744b-4768-a6c0-4fca8e27d166',
                                        name: 'Huawei P30 Pro - Android:  9.0  - SCREEN: 1080 x 2340 dpi 360'
                                    },
                                ]}/>
                            </Card>
                        }
                    </FormDataConsumer>
                    <br/>


                    <FormDataConsumer>
                        {({formData, ...rest}) => formData.tipo_app === 'web' && <Fragment>
                            <Card style={{width: '100%'}}>
                                <Typography variant="h6" gutterBottom>Tipos de Pruebas <hr/></Typography>
                                <SelectArrayInput label="Pruebas" source="pruebas" fullWidth choices={[
                                    {id: 'e2e', name: 'E2E'},
                                    {id: 'random', name: 'RANDOM'},
                                    {id: 'bdt', name: 'BDT'},

                                ]}/> </Card></Fragment>
                        }
                    </FormDataConsumer>

                    <FormDataConsumer>
                        {({formData, ...rest}) => formData.tipo_app === 'movil' && <Fragment>
                            <Card style={{width: '100%'}}>
                                <Typography variant="h6" gutterBottom>Tipos de Pruebas <hr/></Typography>
                                <SelectArrayInput label="Pruebas" source="pruebas" fullWidth choices={[
                                    {id: 'random', name: 'RANDOM'},
                                    {id: 'bdt', name: 'BDT'},

                                ]}/> </Card></Fragment>
                        }
                    </FormDataConsumer>


                    <FormDataConsumer>
                        {formDataProps => formDataProps.id_app && (
                            <Card style={{width: '100%'}}>
                                <TabPruebas {...formDataProps} />
                            </Card>
                        )}
                    </FormDataConsumer>


                </div>
            </SimpleForm>
        </Create>
    );
};


const TabPruebas = ({formData, ...rest}) => {
    return (
        <Fragment>
            <TabbedShowLayout   {...rest}>
                {formData.pruebas
                && formData.pruebas.includes('e2e') && <Tab label="E2E">
                    <FileInput source="filesE2E" label="Script E2E">
                        <FileField source="urlFile" title="nomfile"/>
                    </FileInput>
                </Tab>}

                {formData.pruebas
                && formData.pruebas.includes('bdt') && <Tab label="BDT">
                    <FileInput source="filesBDT" label="Script BDT">
                        <FileField source="urlFile" title="nomFile"/>
                    </FileInput>
                </Tab>}

                {formData.pruebas
                && formData.pruebas.includes('random') && <Tab label="RANDOM">
                    <Card style={{width: '100%'}}>


                        {formData.tipo_app === 'movil' && <Fragment>
                            <Typography variant="h6" gutterBottom>Parámetros <hr/></Typography>
                            <Box display="flex" justifyContent="center" m={1} p={1}
                                 bgcolor="background.paper">
                                <Box p={1} width="50%">
                                    <TextInput source="semillaRandom" label="Semilla" fullWidth/>
                                </Box>
                                <Box p={1} width="50%">
                                    <TextInput source="numEventos" label="Número de Eventos" fullWidth/>
                                </Box>

                            </Box>

                        </Fragment>}
                        {formData.tipo_app === 'web' && <FileInput source="filesRANDOM" label="Script RANDOM">
                            <FileField source="urlFile" title="nomFile"/>
                        </FileInput>}
                    </Card>
                </Tab>}
            </TabbedShowLayout>
        </Fragment>
    );
};


export default StrategyCreate;