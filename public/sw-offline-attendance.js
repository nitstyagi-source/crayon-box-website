/**
 * Crayon Box School Offline Attendance & Gate Scanner Service Worker
 * Intercepts attendance recording requests when offline and buffers
 * events into IndexedDB. Automatically flushes queue when back online.
 */

const CACHE_NAME = 'cbs-offline-v1';
const OFFLINE_URLS = [
  '/',
  '/admin/gate-scanner',
  '/kiosk',
  '/staff/attendance',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => console.log('Cache prefetch error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for background sync event to flush queued offline taps
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance-queue') {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  console.log('[Offline ServiceWorker] Background sync triggered: Flushing queued taps to server...');
  // Post message to client window to trigger database synchronization
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'FLUSH_OFFLINE_ATTENDANCE' });
  }
}
