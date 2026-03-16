// CC Hub Service Worker v1
const CACHE_NAME = 'cchub-v1';
const STATIC_ASSETS = ['/', '/feed', '/offline'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match('/offline')))
  );
});

// ─── Push Notification Handler ───────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'CC Hub 🚌', {
      body:  data.body  || 'You have a new notification',
      icon:  data.icon  || '/logo.jpeg',
      badge: '/logo.jpeg',
      data:  { url: data.url || '/' },
      tag:   data.tag  || 'cchub-notification',
      renotify: true,
      actions: [
        { action: 'open',    title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const existing = list.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
