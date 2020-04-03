import React from 'react';
import {Query, Loading, Error} from 'react-admin';


const NestedFieldApp = ({record}) => (
    <Query type="getOne" resource="strategyTests" payload={{id: record.id_estrategia}}>
        {result1 =>
            result1.loading ? (
                <Loading/>
            ) : result1.error ? (
                <Error/>
            ) : (
                <Query type="getOne" resource="apps" payload={{id: result1.data['prueba.id_app']}}>
                    {result2 =>
                        result2.loading ? (
                            <Loading/>
                        ) : result2.error ? (
                            <Error/>
                        ) : (
                            <ul>
                                <li>Nombre: {result2.data.nombre}</li>
                                <li>Tipo: {result2.data.tipo_app}</li>
                            </ul>

                        )
                    }
                </Query>
            )
        }
    </Query>
);

export default NestedFieldApp;