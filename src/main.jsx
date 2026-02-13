import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
// import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/authConfig";
import './index.css';
import App from './App'

console.log('Main: Rendering App immediately...');

const root = createRoot(document.getElementById('root'));

// Attempt to initialize MSAL in the background, but don't block render
msalInstance.initialize()
  .then(() => console.log('Main: MSAL initialized in background'))
  .catch(err => console.error('Main: MSAL background init failed', err));

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
