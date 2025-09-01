// service-worker.js (corregido)
const CACHE_NAME = "caritasCNC-v5";

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

self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("❌ Falló el cacheo inicial:", err))
  );
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Activando Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Borrando caché antiguo:", key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") {
    // Evitar cachear POST/PUT/etc
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          // Guardar nuevas respuestas en caché (solo http/https)
          if (req.url.startsWith("http")) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "📢 Cáritas CNC", body: "Tienes una nueva notificación." };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("index.html") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("./index.html");
    })
  );
});

self.addEventListener("message", (event) => {
  const { action, texto, delay } = event.data || {};

  if (action === "ping") {
    event.source.postMessage({ reply: "pong" });
  }

  if (action === "programarRecordatorio" && texto && delay) {
    setTimeout(() => {
      self.registration.showNotification("⏰ Recordatorio Cáritas CNC", {
        body: texto,
        icon: "./icon-192.png",
        badge: "./icon-192.png"
      });
    }, delay);
  }
});
