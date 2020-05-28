import React, {Fragment} from 'react';
import {Error, Loading, Query, TextInput} from 'react-admin';

const TypeAppCmp = ({formData}) => {
    return (
        <Fragment>
            {formData.id_app && <Query type="getOne" resource="apps" payload={{id: formData.id_app}}>
                {result => result.loading ? (<Loading/>) : result.error ? (<Error/>)
                    : (
                        <Fragment>
                        <TextInput source="tipo_app" label="Tipo" value={result.data.tipo_app} fullWidth/>
                            <div style={{display: 'none'}}>{formData.tipo_app = result.data.tipo_app}</div>
                        </Fragment>
                    )
                }
            </Query>}
        </Fragment>
    );

};

export default TypeAppCmp;