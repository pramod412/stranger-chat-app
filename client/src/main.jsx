import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SocketProvider } from './contexts/SocketContext';
import { WebRTCProvider } from './contexts/WebRTCContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <WebRTCProvider>
        <App />
      </WebRTCProvider>
    </SocketProvider>
  </React.StrictMode>
);
