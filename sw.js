/* ASCENSÃO OS – Service Worker v7 */
const CACHE = 'ascensao-os-v7';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sw.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try{
      const fresh = await fetch(req);
      const c = await caches.open(CACHE);
      c.put(req, fresh.clone());
      return fresh;
    }catch(err){
      return caches.match('./index.html');
    }
  })());
});
