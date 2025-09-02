// service-worker.js — PWA Cáritas CNC

const CACHE_NAME = "caritas-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles-caritas.css",
  "./main.js",
  "./icon.png"
];

// Instalación
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  console.log("✅ Service Worker activado");
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).catch(() =>
        caches.match("./index.html")
      )
    )
  );
});

// Push notifications
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "📢 Notificación Cáritas CNC";
  const options = {
    body: data.body || "Nuevo aviso",
    icon: "./icon.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
