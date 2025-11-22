// service-worker.js — Caché básica para Cáritas CNC
const CACHE_NAME = "caritas-cnc-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles-caritas.css",
  "./main.js",
  "./self-heal-caritas.js",
  "./manifest.webmanifest",
  "./credenciales.html",
  "./login.html",
  "./login.js",
  "./img/favicon.ico",
  "./img/favicon.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./videos/fondo.mp4"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first para recursos de la propia app
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo manejamos recursos de este mismo sitio (GitHub Pages de la app)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});