/**
 * AutoGest Service Worker
 * Estratégia: Cache-first para assets locais (inclui Chart.js e fonte) e para /vendor/
 * (baixado só no primeiro uso), Network-first para o resto
 * Versão: incrementar ao mudar arquivos em CACHE_STATIC
 */

const CACHE_VERSION = "v11";
const CACHE_NAME = `autogest-${CACHE_VERSION}`;
const CACHE_STATIC = `autogest-static-${CACHE_VERSION}`;
const CACHE_CDN = `autogest-cdn-${CACHE_VERSION}`;
// Bibliotecas grandes sob demanda (leitor de recibo). Fora do CACHE_VERSION de
// propósito: atualizar o app não deve apagar ~5 MB já baixados. Cada versão da
// biblioteca fica numa pasta própria (/vendor/tesseract/v7.0.0/), então URLs novas
// nunca colidem com as antigas.
const CACHE_VENDOR = "autogest-vendor-1";

// Arquivos locais que devem ser cacheados imediatamente (caminhos absolutos a partir da raiz)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css",
  "/manifest.json",
  "/chart.umd.min.js",
  "/assets/icons/icon-72.png",
  "/assets/icons/icon-96.png",
  "/assets/icons/icon-128.png",
  "/assets/icons/icon-144.png",
  "/assets/icons/icon-152.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-384.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon.svg",
  "/assets/fonts/inter-latin-var.woff2",
];

// Instalação: pré-cache dos assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => {
        console.log("[SW] Pré-cache de assets estáticos");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Ativação: limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_STATIC && name !== CACHE_CDN && name !== CACHE_VENDOR,
            )
            .map((name) => {
              console.log("[SW] Removendo cache antigo:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP(S)
  if (!url.protocol.startsWith("http")) return;

  // Estratégia por tipo de recurso
  if (url.origin === location.origin && url.pathname.startsWith("/vendor/")) {
    // Cache-first, mas só no primeiro uso (sem pré-cache: é grande)
    event.respondWith(cacheFirst(request, CACHE_VENDOR));
  } else if (isStaticAsset(url)) {
    // Cache-first para assets locais
    event.respondWith(cacheFirst(request, CACHE_STATIC));
  } else {
    // Default: network-first para tudo o mais
    event.respondWith(networkFirst(request, CACHE_CDN));
  }
});

/**
 * Verifica se é um asset estático local
 */
function isStaticAsset(url) {
  // Verifica se é mesma origem
  if (url.origin !== location.origin) return false;

  const pathname = url.pathname;

  // Raiz e index.html
  if (pathname === "/" || pathname === "/index.html") return true;

  // Verifica contra lista de assets estáticos conhecidos
  return STATIC_ASSETS.some((asset) => {
    // Normaliza: remove / inicial para comparação
    const assetPath = asset.startsWith("/") ? asset : "/" + asset;
    return pathname === assetPath || pathname.endsWith(assetPath);
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
    if (request.mode === "navigate") {
      return cache.match("/index.html");
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
    if (request.mode === "navigate") {
      return cache.match("/index.html");
    }
    throw error;
  }
}

// Sincronização em background (opcional - para futuras features)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncLocalData());
  }
});

async function syncLocalData() {
  // Placeholder para futura sincronização com backend
  console.log("[SW] Background sync triggered");
}

// Notificações push (opcional - para futuras features)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-72.png",
    vibrate: [100, 50, 100],
    data: data.url ? { url: data.url } : {},
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
