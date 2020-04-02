import React from 'react';

import simpleRestProvider from 'ra-data-simple-rest';

import {Admin, Resource} from 'react-admin';

import spanishMessages from '@blackbox-vision/ra-language-spanish';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import Layout from './layout/Layout';
import theme from './layout/Theme';
import NotFound from './layout/NotFound';

import Dashboard from './dashboard/Dashboard';
import applications from './applications';
import versions from './versions';
import strategies from './strategies';
import executions from './executions';

const dataProvider = simpleRestProvider('http://localhost:8080');
const i18nProvider = polyglotI18nProvider(() => spanishMessages, 'es');


const App = () => (
    <Admin dashboard={Dashboard} locale="es"
           dataProvider={dataProvider}
           i18nProvider={i18nProvider}
           theme={theme}
           layout={Layout}
           catchAll={NotFound}>
        <Resource name="apps"  {...applications} options={{label: 'Aplicaciones'}}/>
        <Resource name="versions"  {...versions} options={{label: 'Versión de Aplicaciones'}}/>
        <Resource name="strategies" {...strategies} options={{label: 'Estrategias de Prueba'}}/>
        <Resource name="executions" {...executions} options={{label: 'Ejecución de Estrategias'}}/>
        <Resource name="strategyTests"/>

        <Resource name="historicalTests"/>
    </Admin>
);


export default App;