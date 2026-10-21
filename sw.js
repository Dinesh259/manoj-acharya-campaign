/* ==========================================================================
   sw.js — Offline-First Service Worker with Stale-While-Revalidate
   Pre-caches all core HTML pages, assets, scripts, and stylesheets for 0ms loads
   ========================================================================== */

var CACHE_NAME = 'mka-native-v14';

var CORE_ASSETS = [
  './',
  './index.html',
  './how-to-vote.html',
  './check-name.html',
  './find-booth.html',
  './contact.html',
  './manifesto.html',
  './about.html',
  './sarpanch-role.html',
  './faq.html',
  './village-issues.html',
  './ask.html',
  './flyer.html',
  './css/style.css',
  './js/i18n.js',
  './js/app.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/poster.jpg',
  './assets/meeting-poster.jpg',
  './assets/meeting-1.jpg',
  './assets/meeting-2.jpg',
  './assets/meeting-3.jpg',
  './assets/meeting-4.jpg',
  './assets/meeting-5.jpg',
  './assets/meeting-6.jpg',
  './assets/meeting-7.jpg',
  './assets/meeting-8.jpg',
  './assets/meeting-9.jpg',
  './assets/meeting-10.jpg',
  './assets/media/meeting-video-1-thumb.jpg',
  './assets/media/meeting-video-2-thumb.jpg',
  './assets/media/meeting-video-3-thumb.jpg',
  './assets/media/meeting-video-4-thumb.jpg',
  './assets/cand-1.jpg',
  './assets/cand-2.jpg',
  './assets/cand-2-danaram.jpg',
  './assets/cand-3.jpg',
  './assets/cand-4.jpg',
  './assets/cand-5.jpg',
  './data/manifesto.json',
  './data/booths.json',
  './data/issues.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.map(function (url) {
          return fetch(new Request(url, { cache: 'reload' })).then(function (res) {
            return cache.put(url, res);
          }).catch(function () {
            return cache.add(url);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Stale-While-Revalidate Fetch Strategy */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  // Bypass external requests (Google Analytics, GTM, external CDNs, government portals)
  if (url.origin !== self.location.origin) return;

  // For HTML pages and JS scripts: Network-First so code and content updates apply immediately
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname === '/' || url.pathname === '') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function () {
        return caches.match(event.request) || caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      // Revalidate in background and update cache
      var fetchPromise = fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function () {
        // Fallback when network fails completely
        return cachedResponse || caches.match('./index.html');
      });

      // 0ms return from cache if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
