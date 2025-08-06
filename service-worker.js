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

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
