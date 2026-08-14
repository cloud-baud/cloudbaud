import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
// import { msalInstance } from "@/lib/authConfig";
import './index.css';
import App from './App'

console.log('Main: Rendering App immediately...');

const root = createRoot(document.getElementById('root'));

// MSAL is deactivated because Microsoft Azure has been discontinued for cloudbaud.com
// msalInstance.initialize()
//   .then(() => console.log('Main: MSAL initialized in background'))
//   .catch(err => console.error('Main: MSAL background init failed', err));

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
