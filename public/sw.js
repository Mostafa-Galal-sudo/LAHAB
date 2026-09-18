const CACHE_NAME = 'lahab-offline-v1';
const OFFLINE_PAGE = '/offline';

async function cacheOfflineShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(OFFLINE_PAGE);
  if (!response.ok) throw new Error('Offline page could not be cached.');

  await cache.put(OFFLINE_PAGE, response.clone());
  const html = await response.text();
  const shellAssets = [...html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)]
    .map((match) => match[1])
    .filter((path, index, paths) => path !== OFFLINE_PAGE && paths.indexOf(path) === index);

  await cache.addAll(shellAssets);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflineShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_PAGE).then((response) => response || caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
