import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IconContext } from '@phosphor-icons/react';
import App from './App.tsx';
import LegalPage from './components/LegalPage';
import '@fontsource-variable/plus-jakarta-sans';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Friendly two-tone icons everywhere by default */}
    <IconContext.Provider value={{ weight: 'duotone' }}>
      {path === '/privacy' ? <LegalPage kind="privacy" /> : path === '/terms' ? <LegalPage kind="terms" /> : <App />}
    </IconContext.Provider>
  </StrictMode>
);
