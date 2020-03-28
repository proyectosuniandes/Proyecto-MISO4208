import React from 'react';

import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import BeenhereIcon from '@material-ui/icons/Beenhere';



import simpleRestProvider from 'ra-data-simple-rest';

import Dashboard from './components/Dashboard';
import {Admin, Resource} from 'react-admin';

import spanishMessages from '@blackbox-vision/ra-language-spanish';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import Layout from './layout/Layout';
import theme from './layout/Theme';
import NotFound from './layout/NotFound';

import {ApplicationList, ApplicationEdit, ApplicationCreate} from './components/Applications';
import {TestList} from './components/Strategy';

const dataProvider = simpleRestProvider('http://localhost:8080');
const i18nProvider = polyglotI18nProvider(() => spanishMessages, 'es');




const App = () => (
    <Admin dashboard={Dashboard}
           dataProvider={dataProvider}
           i18nProvider={i18nProvider}
           theme={theme}
           layout={Layout}
           catchAll={NotFound}>
        <Resource name="applications" options={{label: 'Aplicaciones'}} icon={SettingsApplicationsIcon}
                  list={ApplicationList}
                  edit={ApplicationEdit}
                  create={ApplicationCreate}/>
        <Resource name="strategy" options={{label: 'Estrategias de Prueba'}} icon={BeenhereIcon}
                  list={TestList}/>
        <Resource name="tests"/>
        <Resource name="historicalTests"/>
    </Admin>
);





export default App;