// Service Worker Unregister Script
// This script aggressively removes all service workers and caches
// Use this in development to prevent caching issues

(function() {
  'use strict';

  console.log('[SW-Unregister] Starting service worker cleanup...');

  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      if (registrations.length === 0) {
        console.log('[SW-Unregister] No service workers found');
        return;
      }

      console.log('[SW-Unregister] Found', registrations.length, 'service worker(s)');
      
      registrations.forEach(function(registration) {
        registration.unregister().then(function(success) {
          if (success) {
            console.log('[SW-Unregister] Successfully unregistered:', registration.scope);
          } else {
            console.warn('[SW-Unregister] Failed to unregister:', registration.scope);
          }
        });
      });
    }).catch(function(error) {
      console.error('[SW-Unregister] Error getting registrations:', error);
    });
  }

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      if (cacheNames.length === 0) {
        console.log('[SW-Unregister] No caches found');
        return;
      }

      console.log('[SW-Unregister] Found', cacheNames.length, 'cache(s)');
      
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW-Unregister] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('[SW-Unregister] All caches cleared');
    }).catch(function(error) {
      console.error('[SW-Unregister] Error clearing caches:', error);
    });
  }

  // Clear localStorage items that might be stale
  try {
    const keysToCheck = ['token', 'user', 'authToken', 'userData'];
    keysToCheck.forEach(function(key) {
      if (localStorage.getItem(key)) {
        console.log('[SW-Unregister] Found localStorage key:', key);
      }
    });
  } catch (error) {
    console.error('[SW-Unregister] Error checking localStorage:', error);
  }

  console.log('[SW-Unregister] Cleanup complete');
})();
