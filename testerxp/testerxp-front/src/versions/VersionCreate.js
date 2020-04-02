import React from "react";
import {
    Create,
    FileField,
    FileInput,
    FormDataConsumer,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    TextInput
} from "react-admin";

import {Box, Typography} from "@material-ui/core";
import {Styles} from "@material-ui/styles/withStyles";
import {makeStyles, Theme} from "@material-ui/core/styles";

export const styles: Styles<Theme, any> = {
    izq: {display: 'inline-block'},
    der: {display: 'inline-block', marginLeft: 32},
    ruta: {width: 800},
};
const useStyles = makeStyles(styles);

const VersionCreate = (props: any) => {
    const classes = useStyles();
    return (

        <Create {...props}>
            <SimpleForm>
                <Typography variant="h6" gutterBottom>
                    Aplicación
                </Typography>
                <Box mt="1em"/>

                <ReferenceInput label="Nombre" source="id_app" reference="apps" formClassName={classes.izq}
                                sort={{field: 'id_app', order: 'ASC'}}>
                    <SelectInput optionText="nombre" />
                </ReferenceInput>


                <FormDataConsumer formClassName={classes.der}>
                    {({formData, ...rest}) => formData['id_app'] &&
                        <ReferenceInput label="Tipo" source="id_app" reference="apps" {...rest}
                                        sort={{field: 'id_app', order: 'ASC'}}>
                            <SelectInput optionText="tipo_app" disabled/>
                        </ReferenceInput>
                    }
                </FormDataConsumer>


                <Box mt="1em"/>
                <Typography variant="h6" gutterBottom>
                    Versión
                </Typography>

                <Box mt="1em"/>

                <TextInput source="descripcion" label="Versión Aplicación"/>


                <FormDataConsumer fullWidth>
                    {({formData, ...rest}) => formData['id_app'] === 1 &&
                        <TextInput source="ruta_app" {...rest} label="Ruta Aplicación"/>
                    }
                </FormDataConsumer>


                <Box mt="1em"/>

                <FormDataConsumer>
                    {({formData, ...rest}) => formData['id_app'] !== 1 &&
                        <FileInput source="files" {...rest} label="Archivo Aplicación Móvil">
                            <FileField source="ruta_app" {...rest} title="Ruta"/>
                        </FileInput>
                    }
                </FormDataConsumer>


            </SimpleForm>
        </Create>
    );
};

export default VersionCreate;