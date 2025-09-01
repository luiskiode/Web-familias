// service-worker.js (optimizado)
const CACHE_NAME = "caritasCNC-v6"; // 🔄 cambia al actualizar assets

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

// === Install ===
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("❌ Falló el cacheo inicial:", err))
  );
});

// === Activate ===
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

// === Fetch (estrategia network-first para HTML, cache-first para assets) ===
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") {
    return; // no cacheamos POST/PUT/etc
  }

  const isHTML = req.headers.get("accept")?.includes("text/html");

  event.respondWith(
    (async () => {
      if (isHTML) {
        // network-first para documentos HTML
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return caches.match(req).then((res) => res || caches.match("./index.html"));
        }
      } else {
        // cache-first para assets estáticos
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (req.url.startsWith("http")) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch {
          return caches.match("./index.html");
        }
      }
    })()
  );
});

// === Push notifications ===
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "📢 Cáritas CNC",
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

// === Notification click ===
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

// === Mensajes entre app y SW ===
self.addEventListener("message", (event) => {
  const { action, texto, delay } = event.data || {};

  if (action === "ping") {
    event.source?.postMessage({ reply: "pong" });
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