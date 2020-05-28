import React from 'react';
import { Route } from 'react-router-dom';
import Mutation from './mutation/Mutation';

export default [
    <Route exact path="/mutation" render={props => <Mutation  {...props} />} />,
];
