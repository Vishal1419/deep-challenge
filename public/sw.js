let CACHE_NAME = 'appV1';

this.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll([
        '/static/js/main.chunk.js',
        '/static/js/0.chunk.js',
        '/static/js/bundle.js',
        '/index.html',
        '/',
      ]);
    }),
  );
});

this.addEventListener('fetch', (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response;
      }),
    );
  }
});

// this.addEventListener('activate', (event) => {
//   const cacheWhitelist = [];
//   cacheWhitelist.push(CACHE_NAME);
//   event.waitUntil(
//     caches.keys().then((cacheNames) => Promise.all(
//       cacheNames.map((cacheName) => {
//         if(!cacheWhitelist.includes(cacheName)) {
//           return caches.delete(cacheName);
//         }
//       }),
//     )),
//   );
// });
