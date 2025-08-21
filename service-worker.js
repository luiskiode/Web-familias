// =============================
// CONFIG
// =============================
const CACHE_NAME = "caritasCNC-v4";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"
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
        return res;
      }
      return fetch(event.request).catch(() => {
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
    clients.openWindow("./index.html")
  );
});

// =============================
// MENSAJES DESDE LA PÁGINA
// =============================
self.addEventListener("message", (event) => {
  if (event.data?.action === "ping") {
    event.source.postMessage({ reply: "pong" });
  }

  if (event.data?.action === "programarRecordatorio") {
    const { texto, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification("⏰ Recordatorio Cáritas CNC", {
        body: texto,
        icon: "./icon-192.png",
        badge: "./icon-192.png"
      });
    }, delay);
  }
});

// =============================
// FUNCIÓN ASÍNCRONA DE EJEMPLO
// =============================
function doAsyncTask() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("✅ Tarea completada"), 1000);
  });
}
