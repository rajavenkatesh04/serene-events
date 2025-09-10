// This is the simplest possible service worker.
// It just confirms its installation.

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
    // For now, we are not caching anything.
    // The browser will handle network requests as usual.
    event.respondWith(fetch(event.request));
});