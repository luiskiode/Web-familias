const CACHE_NAME = "caritasCNC-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./login.html",
  "./styles.css",
  "./manifest.json",
  "./firebase-config.js",
  "./supabase-config.js",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"
];

// =============================
// INSTALACIÓN DEL SERVICE WORKER
// =============================
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error("❌ Falló el cacheo inicial:", err))
  );
});

// =============================
// ACTIVACIÓN Y LIMPIEZA DE CACHÉ ANTIGUO
// =============================
self.addEventListener("activate", (event) => {
  console.log("🚀 Activando Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => {
        if (k !== CACHE_NAME) {
          console.log("🧹 Borrando caché antiguo:", k);
          return caches.delete(k);
        }
      }))
    )
  );
});

// =============================
// INTERCEPTAR PETICIONES (OFFLINE SUPPORT)
// =============================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      if (res) {
        console.log("⚡ Sirviendo desde caché:", event.request.url);
        return res;
      }
      return fetch(event.request).catch(() => {
        console.warn("🌐 Sin conexión, mostrando fallback.");
        return caches.match("./index.html");
      });
    })
  );
});

// =============================
// NOTIFICACIONES PUSH
// =============================
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Nueva alerta Cáritas CNC",
    body: "Tienes una nueva notificación."
  };

  console.log("🔔 Push recibido:", data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png"
    })
  );
});

// =============================
// CLICK EN NOTIFICACIÓN
// =============================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("./index.html") // redirige a la app al hacer clic
  );
});

// =============================
// MENSAJES DESDE LA PÁGINA
// =============================
self.addEventListener("message", (event) => {
  console.log("📩 Mensaje recibido en SW:", event.data);

  // Respuesta segura a cualquier mensaje
  if (event.data?.action === "ping") {
    event.source.postMessage({ reply: "pong" });
  }

  // Ejemplo de tarea asíncrona
  if (event.data?.action === "asyncTask") {
    doAsyncTask()
      .then(result => event.source.postMessage({ success: true, result }))
      .catch(err => event.source.postMessage({ success: false, error: err.message }));
  }
});

// Función de ejemplo para tareas asíncronas
function doAsyncTask() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("✅ Tarea completada"), 1000);
  });
}
