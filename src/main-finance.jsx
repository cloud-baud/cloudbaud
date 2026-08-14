import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
// import { msalInstance } from "@/lib/authConfig";
import './index.css';
import FinanceApp from './FinanceApp'

console.log('Finance Main: Bootstrapping isolated Finance Console...');

const root = createRoot(document.getElementById('root'));

// MSAL is deactivated because Microsoft Azure has been discontinued for cloudbaud.com
// msalInstance.initialize()
//   .then(() => console.log('Finance Main: MSAL initialized in background'))
//   .catch(err => console.error('Finance Main: MSAL background init failed', err));

root.render(
  <StrictMode>
    <HelmetProvider>
      <FinanceApp />
    </HelmetProvider>
  </StrictMode>,
);
