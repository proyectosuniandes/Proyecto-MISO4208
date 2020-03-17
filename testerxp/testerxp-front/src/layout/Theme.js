import {red} from '@material-ui/core/colors';
import {createMuiTheme} from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
    sidebar: {
        width: 240, // The default value is 240
        closedWidth: 55, // The default value is 55
    },
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#4a8cd4',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});

export default theme;