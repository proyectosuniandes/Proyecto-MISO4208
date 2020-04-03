import React from 'react';
import {Error, Loading, Query} from 'react-admin';


const NestedFieldVersion = ({record}) => (
    <Query type="getOne" resource="strategyTests" payload={{id: record.id_estrategia}}>
        {result1 =>
            result1.loading ? (
                <Loading/>
            ) : result1.error ? (
                <Error/>
            ) : (
                <Query type="getOne" resource="versions" payload={{id: result1.data['prueba.id_version']}}>
                    {result2 =>
                        result2.loading ? (
                            <Loading/>
                        ) : result2.error ? (
                            <Error/>
                        ) : (
                            result2.data.descripcion
                        )
                    }
                </Query>
            )
        }
    </Query>
);

export default NestedFieldVersion;