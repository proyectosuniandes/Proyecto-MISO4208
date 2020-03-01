import React from 'react';
import { Layout } from 'react-admin';
import AppBar from './AppBar';
//import AppMenu from './Menu';

//menu={AppMenu}
const LayoutApp = (props) => <Layout {...props} appBar={AppBar}   />;

export default LayoutApp;
