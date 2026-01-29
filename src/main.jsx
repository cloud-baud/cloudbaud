import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/authConfig";
import './index.css'
import App from './App.jsx'

// Initialize MSAL outside the root render to avoid re-instantiation
msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </MsalProvider>
    </StrictMode>,
  )
});
