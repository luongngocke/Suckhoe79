/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch - required for some PWA criteria
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'vitaltrack-reminder'
    });
  }
});
