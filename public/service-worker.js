const CACHE_NAME = "caritas-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/login.html",
  "/firebase-config.js",
  "/supabase-config.js",
  "/manifest.json"
];

// Instalar service worker y cachear archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Servir desde caché cuando no hay internet
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
