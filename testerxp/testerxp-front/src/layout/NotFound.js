import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';

export default () => (
    <Card>
        <Title title="No Encontrada" />
        <CardContent>
            <h1>404: Pagina No Encontrada</h1>
        </CardContent>
    </Card>
);