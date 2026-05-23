import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Service worker cleanup - ONLY in development
const cleanupServiceWorkers = async () => {
  // Only run in development mode
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[DEV] Unregistered service worker:', registration.scope);
      }
      
      // Force reload after unregistering to ensure clean state
      if (registrations.length > 0) {
        console.log('[DEV] Service workers removed. Reloading...');
        window.location.reload();
        return true; // Indicate reload is happening
      }
    } catch (error) {
      console.error('[DEV] Service worker cleanup error:', error);
    }
  }
  return false;
};

// Clear all caches - ONLY in development
const clearAllCaches = async () => {
  // Only run in development mode
  if (import.meta.env.DEV && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('[DEV] Cleared all caches:', cacheNames);
      }
    } catch (error) {
      console.error('[DEV] Cache cleanup error:', error);
    }
  }
};

// Prevent service worker from intercepting requests in development
const preventServiceWorkerCaching = () => {
  if (import.meta.env.DEV && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    console.warn('[DEV] Service worker is still active! Forcing unregister...');
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

// Run cleanup before app initialization
(async () => {
  // Only run cleanup in development mode
  if (import.meta.env.DEV) {
    const reloading = await cleanupServiceWorkers();
    if (reloading) return; // Don't render if we're reloading
    
    await clearAllCaches();
    preventServiceWorkerCaching();
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  // Use StrictMode in development for better error detection
  root.render(
    import.meta.env.DEV ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );
})();

