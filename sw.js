/**
 * AutoGest Service Worker
 * Estratégia: Cache-first para assets estáticos, Network-first para CDN (Chart.js, Fonts)
 * Versão: incrementar ao mudar arquivos em CACHE_STATIC
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `autogest-${CACHE_VERSION}`;
const CACHE_STATIC = `autogest-static-${CACHE_VERSION}`;
const CACHE_CDN = `autogest-cdn-${CACHE_VERSION}`;

// Arquivos locais que devem ser cacheados imediatamente
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './chart.umd.min.js',
];

// Recursos externos (CDN) - cache com network-first (apenas fontes Google)
const CDN_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/',
];

// Instalação: pré-cache dos assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Pré-cache de assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_STATIC && name !== CACHE_CDN)
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP(S)
  if (!url.protocol.startsWith('http')) return;

  // Estratégia por tipo de recurso
  if (isStaticAsset(url)) {
    // Cache-first para assets locais
    event.respondWith(cacheFirst(request, CACHE_STATIC));
  } else if (isCdnResource(url)) {
    // Network-first para CDN (com fallback para cache)
    event.respondWith(networkFirst(request, CACHE_CDN));
  } else {
    // Default: network-first para tudo o mais
    event.respondWith(networkFirst(request, CACHE_CDN));
  }
});

/**
 * Verifica se é um asset estático local
 */
function isStaticAsset(url) {
  return url.origin === location.origin &&
    STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', ''))) ||
    url.pathname === '/' ||
    url.pathname === '/index.html';
}

/**
 * Verifica se é um recurso de CDN conhecido (Google Fonts)
 */
function isCdnResource(url) {
  return CDN_RESOURCES.some(cdn => {
    // Para URLs do Google Fonts, verificar origem
    if (cdn.includes('fonts.googleapis.com') || cdn.includes('fonts.gstatic.com')) {
      return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
    }
    return url.href.startsWith(cdn.split('/').slice(0, 3).join('/'));
  });
}

/**
 * Cache-first: tenta cache, cai para network, atualiza cache
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback para página offline se for navegação
    if (request.mode === 'navigate') {
      return cache.match('./index.html');
    }
    throw error;
  }
}

/**
 * Network-first: tenta network, cai para cache
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback para navegação
    if (request.mode === 'navigate') {
      return cache.match('./index.html');
    }
    throw error;
  }
}

// Sincronização em background (opcional - para futuras features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncLocalData());
  }
});

async function syncLocalData() {
  // Placeholder para futura sincronização com backend
  console.log('[SW] Background sync triggered');
}

// Notificações push (opcional - para futuras features)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: data.url ? { url: data.url } : {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});