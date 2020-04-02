import React from 'react';
import {TabPanel, TabView} from "primereact/tabview";
import {FileField, FileInput, TextInput} from "react-admin";
import {Card} from "primereact/card";
import {Box, Typography} from "@material-ui/core";

const TestTypeCmp = ({record, ...rest}) =>

           <TabView style={{width: '100%'}} >
                <TabPanel header="E2E">
                    <FileInput source="filesE2E" label="Script E2E">
                        <FileField source="urlFile" title="nomfile"/>
                    </FileInput>
                </TabPanel>
                <TabPanel header="RANDOM">

                    <Card style={{width: '100%'}}>
                        <Typography variant="h6" gutterBottom>Parámetros <hr/></Typography>
                        <Box display="flex" justifyContent="center" m={1} p={1} bgcolor="background.paper">
                            <Box p={1} width="50%">
                                <TextInput source="semillaRandom" label="Semilla" fullWidth/>
                            </Box>
                            <Box p={1} width="50%">
                                <TextInput source="numEventos" label="Número de Eventos" fullWidth/>
                            </Box>

                        </Box>
                    </Card>


                </TabPanel>
                <TabPanel header="BDT">

                    <FileInput source="filesBDT" label="Script BDT">
                        <FileField source="fileUrl" title="nomFile"/>
                    </FileInput>

                </TabPanel>
            </TabView>


export default TestTypeCmp;