'use strict';

const scope = self.registration.scope;
const cachePrefix = 'lernhaus-offline:' + scope + ':';
const release = new URL(self.location.href).searchParams.get('v') || 'local';
const cacheName = cachePrefix + 'v1-' + release;
const offlinePage = new URL('offline.html', scope).href;
const publicAssets = new Set([
  'offline.html', 'offline.js', 'theme.js', 'styles.css',
  'assets/icons/lernhaus-180.png', 'assets/vazirmatn.woff2'
].map(path => new URL(path, scope).href));
const appPaths = new Set(['./', 'index.php', 'index.html'].map(path => new URL(path, scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...publicAssets].map(url => new Request(url, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const appNavigation = request.mode === 'navigate' && appPaths.has(url.pathname);
  if (!appNavigation && !publicAssets.has(url.href)) return;
  event.respondWith(fetch(request).catch(async error => {
    const response = await caches.match(appNavigation ? offlinePage : url.href, {cacheName});
    if (response) return response;
    throw error;
  }));
});
