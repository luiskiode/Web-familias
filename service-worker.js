const CACHE_NAME = "caritas-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./login.html",
  "./styles.css",
  "./firebase-config.js",
  "./supabase-config.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalar y cachear archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error("Falló el cacheo inicial", err))
  );
});

// Limpiar versiones anteriores del caché
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

// Interceptar peticiones
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
      .catch(() => new Response("Sin conexión", { status: 503 }))
  );
});
