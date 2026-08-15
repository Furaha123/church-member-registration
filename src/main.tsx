import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { applyThemeAttribute, getInitialTheme } from './theme';

// Set the theme attribute before first paint to avoid a flash of the wrong theme.
applyThemeAttribute(getInitialTheme());

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in document.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
