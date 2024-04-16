// This theme is taken from an example in the MUI docs, URL: https://stackblitz.com/github/mui/material-ui/tree/master/examples/material-ui-vite?file=src%2Ftheme.js

import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
