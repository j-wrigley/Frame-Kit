import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@presentstandards/framekit-ui/styles.css';
import './styles/docs.css';
import './styles/landing.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
