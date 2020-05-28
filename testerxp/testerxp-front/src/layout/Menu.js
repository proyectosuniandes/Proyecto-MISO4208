import React from 'react';
import {useSelector} from 'react-redux';
import {DashboardMenuItem, getResources, MenuItemLink} from 'react-admin';
import DefaultIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';


const Menu = ({onMenuClick}) => {
    const open = useSelector(state => state.admin.ui.sidebarOpen);
    const resources = useSelector(getResources);
    return (
        <div>
            {' '}
            <DashboardMenuItem onClick={onMenuClick} sidebarIsOpen={open}/>
            {resources.filter(r => r.hasList).map(resource => (
                <MenuItemLink
                    key={resource.name}
                    to={`/${resource.name}`}
                    primaryText={
                        (resource.options && resource.options.label) ||
                        resource.name
                    }
                    leftIcon={
                        resource.icon ? <resource.icon/> : <DefaultIcon/>
                    }
                    onClick={onMenuClick}
                    sidebarIsOpen={open}
                />
            ))}

            <MenuItemLink
                to={`/mutation`}
                primaryText="Mutaciones"
                leftIcon={<SettingsIcon/>}
                onClick={onMenuClick}
                sidebarIsOpen={open}
            />

        </div>
    );
};

export default Menu;