import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Gracefully handle benign Vite HMR websocket disconnections in sandboxed / container dev environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || event?.reason || '';
    if (
      typeof reason === 'string' &&
      (reason.includes('WebSocket') ||
        reason.includes('websocket') ||
        reason.includes('vite') ||
        reason.includes('closed without opened'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      typeof msg === 'string' &&
      (msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('closed without opened'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // Register service worker for PWA installation & offline capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[Student Wand PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Student Wand PWA] ServiceWorker registration notice:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Student Wand encountered an unexpected issue">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

