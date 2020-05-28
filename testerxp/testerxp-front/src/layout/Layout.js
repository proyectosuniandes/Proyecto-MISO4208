import React from 'react';
import { Layout } from 'react-admin';
import AppBar from './AppBar';
import AppMenu from '../layout/Menu';

const LayoutApp = (props) => <Layout {...props} appBar={AppBar} menu={AppMenu} />;

export default LayoutApp;
