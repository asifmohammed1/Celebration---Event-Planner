/**
 * @fileoverview Service Worker: Cache-First for static assets,
 *               network-only for API calls.
 * @version 1.0.0
 */

const CACHE_NAME = 'cep-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/ui.js',
  '/js/gemini.js',
  '/js/event.js',
  '/js/planner.js',
  '/js/budget.js',
  '/js/app.js',
  '/manifest.json',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.url.includes('generativelanguage.googleapis.com')) { return; }
  evt.respondWith(
    caches.match(evt.request).then((cached) => cached || fetch(evt.request)),
  );
});
