const CACHE_NAME = "jadwal-web-cache-v1";
const urlsToCache = [
  "./",            // index.html
  "./add.html",
  "./firebase.js",
  "./generate-env.js",
  "./index.html",
  "./manifest.json",
  "./script.js",
  "./style.js",
  "./sw.js"
];

// Install SW dan simpan cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch offline support
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Klik notifikasi (kalau ada notifikasi)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("./"));
});
