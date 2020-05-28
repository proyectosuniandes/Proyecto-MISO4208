import React from 'react';
import {Datagrid, EditButton, List, ReferenceField, TextField, UrlField, CardActions, CreateButton } from 'react-admin';
import {makeStyles} from '@material-ui/core/styles';
import {Route} from 'react-router';
import MutationCreate from './MutationCreate';




const useStyles = makeStyles({
    label: {width: '10em', display: 'inline-block'},
    button: {margin: '1em'},
});

let fakeProps = {
    basePath: "/versions",
    hasCreate: false,
    hasEdit: false,
    hasList: true,
    hasShow: false,
    history: {},
    location: {pathname: "/", search: "", hash: "", state: undefined},
    match: {path: "/", url: "/", isExact: true, params: {}},
    options: {},
    permissions: null,
    resource: "versions"
}

const MutationListActions = ({ basePath }) => (
      <CardActions>
              <CreateButton basePath={'/mutation'} />
          </CardActions>
    );


const Mutation = () => {
    return (
        <React.Fragment>

            <List {...fakeProps} sort={{field: 'id_app', order: 'ASC'}} title="Lista de Versiones Mutantes"
                  filterDefaultValues={{
                      descripcion: '%MutAPK%'
                  }} actions={<MutationListActions />}>
                <Datagrid>
                    <TextField source="id"/>
                    <ReferenceField source="id_app" reference="apps" label="Aplicación">
                        <TextField source="nombre"/>
                    </ReferenceField>
                    <ReferenceField source="id_app" reference="apps" label="Tipo Aplicación">
                        <TextField source="tipo_app"/>
                    </ReferenceField>
                    <TextField source="descripcion" label="Versión Mutante"/>
                    <UrlField source="ruta_app" label="Ruta Aplicación"/>
                    <EditButton label="Editar"/>
                </Datagrid>
            </List>
            <Route
                path="/mutation/MutationCreate"
                render={() => (
                    <MutationCreate {...fakeProps} />
                )}
            />
        </React.Fragment>
    )
};

export default Mutation;
