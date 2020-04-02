import React from 'react';
import {Query, Loading, Error, TextInput} from 'react-admin';


const TypeAppCmp = ({record}) => (
    <Query type="getOne" resource="apps" payload={{id: record.id_app}}>
        {result1 =>
            result1.loading ? (
                <Loading/>
            ) : result1.error ? (
                <Error/>
            ) : (
                <TextInput source={result2.data.tipo_app}  label="Tipo Aplicación" fullWidth/>
            )
        }
    </Query>
);

export default TypeAppCmp;