// sw.js
//Rutas cambiadas
const CACHE_NAME = 'pwa-ganado-v1';
const ASSETS = [                   
  'index.html',
  'js/firebase-config.js',
  'js/db.js',
  'js/app.js',
  'js/utils.js',
  'css/style.css',     // si tienes 
  'views/agregar.html',
  'views/main.html',
  // añade aquí todos los recursos estáticos que uses
];

// 1) Instalar el SW y cachear assets
self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2) Activar el SW y limpiar caches antiguas
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 3) Estrategia de fetch: cache-first
self.addEventListener('fetch', (ev) => {
  ev.respondWith(
    caches.match(ev.request).then(cached => {
      if (cached) return cached;
      return fetch(ev.request);
    })
  );
});
