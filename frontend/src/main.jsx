import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#181a20',
          color: '#e8e8ed',
          border: '1px solid #2b2d35',
          borderRadius: '8px',
        },
      }}
    />
  </React.StrictMode>
);
