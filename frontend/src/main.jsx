import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '@fontsource/inter';
import CssBaseline from '@mui/joy/CssBaseline';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <CssBaseline />
      <App />
  </React.StrictMode>,
);
