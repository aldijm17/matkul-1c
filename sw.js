const CACHE_NAME = "scheduleos-v1.2.0";
const STATIC_CACHE = "scheduleos-static-v1.2.0";
const DYNAMIC_CACHE = "scheduleos-dynamic-v1.2.0";

// Files to cache for offline functionality
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./add.html",
  "./manifest.json",
  "./firebase.js",
  "./script.js",
  "./env.js",
  // Add icon files when available
  "./icon-192.png",
  "./icon-512.png",
  // External resources
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log("✅ Service Worker: Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Service Worker: Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Activating...");
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("🗑️ Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker: Activated successfully");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle Firebase requests
  if (url.origin === 'https://firestore.googleapis.com') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return offline message for Firestore requests
          return new Response(
            JSON.stringify({
              error: "Offline - Data not available",
              offline: true
            }),
            {
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => request.url.includes(asset.replace('./', '')))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return networkResponse;
            });
        })
        .catch(() => {
          // Return offline page for HTML requests
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        })
    );
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for HTML requests
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log("🔄 Service Worker: Background sync triggered:", event.tag);
  
  if (event.tag === 'sync-schedules') {
    event.waitUntil(
      // Implement your sync logic here
      console.log("📅 Syncing schedules in background...")
    );
  }
});

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log("🔔 Push notification received:", data);
    
    const options = {
      body: data.body || "Jadwal kuliah telah diperbarui",
      icon: './icon-192.png',
      badge: './icon-72.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Lihat Jadwal',
          icon: './icon-192.png'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || "ScheduleOS", options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log("💬 Service Worker received message:", event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log("⏰ Periodic sync triggered:", event.tag);
  
  if (event.tag === 'schedule-sync') {
    event.waitUntil(
      // Implement periodic sync logic
      console.log("📅 Periodic schedule sync...")
    );
  }
});

// Log service worker lifecycle
console.log("🚀 ScheduleOS Service Worker v1.2.0 loaded");
console.log("📱 PWA features: Offline support, Background sync, Push notifications");