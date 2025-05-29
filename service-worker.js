
const CACHE_NAME = 'directoryx-cache-v1.1'; // Increment version to force update
const CORE_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/contexts/AppContext.tsx',
  '/views/FilesView.tsx',
  '/views/MatchingLibraryView.tsx',
  '/views/RulesetsView.tsx',
  '/views/MacroOperationsView.tsx',
  '/components/common/Button.tsx',
  '/components/common/Checkbox.tsx',
  '/components/common/Input.tsx',
  '/components/common/Modal.tsx',
  '/components/common/QueryInput.tsx',
  '/components/common/Select.tsx',
  '/components/common/TextArea.tsx',
  '/components/common/Tooltip.tsx',
  // Note: CDN assets are typically cached by the browser, but explicit caching can be added if needed.
  // However, cross-origin caching requires careful handling (e.g. response opacity).
  // For simplicity, we'll rely on browser caching for CDNs, but if offline reliability for them is critical,
  // they can be added here, ensuring their responses are cacheable.
  // 'https://cdn.tailwindcss.com',
  // 'https://esm.sh/react@^19.1.0',
  // 'https://esm.sh/react-dom@^19.1.0/client',
  // 'https://esm.sh/react@^19.1.0/jsx-runtime'
  // Add any other local assets like images/icons if you have them:
  // '/icon-192x192.png',
  // '/icon-512x512.png'
];

// On install, cache the core assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching core assets');
        // Add assets one by one to avoid entire cache failing if one asset is missing
        const promises = CORE_ASSETS_TO_CACHE.map(assetUrl => {
          return cache.add(assetUrl).catch(err => {
            console.warn(`[ServiceWorker] Failed to cache: ${assetUrl}`, err);
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('[ServiceWorker] Core assets cached successfully');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache open/add failed during install:', error);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[ServiceWorker] Claiming clients');
        // Become the active service worker for all clients immediately.
        return self.clients.claim();
    })
  );
});

// On fetch, serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests for caching
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML), use a network-first strategy to ensure latest content,
  // falling back to cache. For other assets, use cache-first.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, clone and cache it
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html'); // Fallback to root index
            });
        })
    );
  } else {
    // Cache-first strategy for other assets (JS, CSS, images etc.)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // console.log('[ServiceWorker] Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // console.log('[ServiceWorker] Fetching from network:', event.request.url);
          return fetch(event.request).then(networkResponse => {
            // If successful, clone and cache it
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }).catch(error => {
            console.error('[ServiceWorker] Fetch failed for:', event.request.url, error);
            // Optionally, you could return a specific offline placeholder for images/assets
            // For now, just let the browser handle the error.
          });
        })
    );
  }
});
