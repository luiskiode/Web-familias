const CACHE_NAME = "caritas-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles-caritas.css",
  "./main.js",
  "./icon.png",

  // Pestañas
  "./pestanas/perfil.html",
  "./pestanas/carnet.html",
  "./pestanas/credencial.html",
  "./pestanas/credenciales-admin.html",
  "./pestanas/servicios.html",
  "./pestanas/listado.html",
  "./pestanas/registro-fam.html",

  // Scripts API
  "./api.js/firebase-config-caritas.js",
  "./api.js/supabase-config-caritas.js",
  "./api.js/notificaciones.js",
  "./api.js/pendientes.js",
  "./api.js/calendario.js",

  // Librerías externas (si las quieres offline)
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js"
];

// Instalación
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Archivos cacheados");
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
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("./index.html")
        )
      );
    })
  );
});

// Push Notifications
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const title = data.title || "📢 Cáritas CNC";
  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: "./icon.png",
    badge: "./icon.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});