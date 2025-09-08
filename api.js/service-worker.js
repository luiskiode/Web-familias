const CACHE_NAME = "caritas-cache-v5";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles-caritas.css",
  "./api.js/self-heal-caritas.js",
  "./api.js/health-caritas.js",
  "./api.js/error-overlay.js",
  "./videos/fondo.mp4",
  "./img/favicon.ico",
  "./img/icon-512.png"
];

// ====== CACHE BÁSICO ======
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request).then(res => res || caches.match("./index.html")))
  );
});

// ====== SYNC CON SUPABASE ======
// Helper IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("caritasDB", 1);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pendientes")) {
        db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

async function getPendientes() {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readonly");
    const store = tx.objectStore("pendientes");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function clearPendiente(id) {
  const db = await openDB();
  const tx = db.transaction("pendientes", "readwrite");
  tx.objectStore("pendientes").delete(id);
  return tx.complete;
}

self.addEventListener("sync", event => {
  if (event.tag === "sync-familias") {
    event.waitUntil(syncPendientes());
  }
});

async function syncPendientes() {
  const pendientes = await getPendientes();
  for (const fam of pendientes) {
    try {
      const res = await fetch("https://qivjlsvcjyqymommfdke.supabase.co/rest/v1/familias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "TU_ANON_KEY",        // ⚠️ pon aquí tu anon key
          "Authorization": "Bearer TU_ANON_KEY"
        },
        body: JSON.stringify([fam])
      });

      if (res.ok) {
        await clearPendiente(fam.id);
        console.log("✅ Familia sincronizada:", fam.nombres_apellidos);
      } else {
        console.error("❌ Error en sync:", await res.text());
      }
    } catch (err) {
      console.error("❌ Error al intentar sync:", err);
    }
  }
}

// ====== PUSH NOTIFICATIONS ======
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const title = data.title || "📢 Cáritas CNC";
  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: "./img/icon-512.png",
    badge: "./img/icon-512.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});