import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Mavi
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#00bcd4', // Turkuaz
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: '#fafafa', // Çok açık gri
      paper: '#ffffff', // Beyaz
    },
    text: {
      primary: '#212121', // Koyu gri
      secondary: '#757575', // Orta gri
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#212121',
    },
    h2: {
      fontWeight: 600,
      color: '#212121',
    },
    h3: {
      fontWeight: 500,
      color: '#212121',
    },
    h6: {
      fontWeight: 500,
      color: '#212121',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default lightTheme;
