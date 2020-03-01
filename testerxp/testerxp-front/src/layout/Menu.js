import React from 'react';
import { MenuItemLink } from 'react-admin';
import { withRouter } from 'react-router-dom';


const MyMenu = ({ resources, onMenuClick, logout }) => (
    <div>
        {resources.map(resource => (
            <MenuItemLink to={`/${resource.name}`} primaryText={resource.name} onClick={onMenuClick} />
        ))}
        <MenuItemLink to="/reference/create" primaryText="New Reference" onClick={onMenuClick} />
    </div>
);

export default withRouter(MyMenu);