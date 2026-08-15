import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" newestOnTop />
    </AuthProvider>
  </StrictMode>,
);
