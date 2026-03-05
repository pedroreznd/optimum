/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const FINNHUB_API_ORIGIN = new URL(import.meta.env.VITE_FINNHUB_API_BASE_URL).origin;

registerRoute(
  ({ url }) => url.origin === FINNHUB_API_ORIGIN,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3
  })
);

registerRoute(
  ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets-cache'
  })
);

const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/api\//]
});
registerRoute(navigationRoute);

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const cache = await caches.open('offline-cache');
    const response = await cache.match('/offline.html');
    if (response) return response;
  }
  return Response.error();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('offline-cache')
      .then((cache) => cache.add('/offline.html'))
      .catch(() => Promise.resolve())
  );
});
