importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// 1. ADDED: Force immediate activation (Fixes "Invalid URL" / Reload issue)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = req.url; 
  
  // 🔴 HARD BYPASS — do NOT touch these
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) return;

  if (
    url.includes("googlesyndication.com") ||
    url.includes("doubleclick.net") ||
    url.includes("googleadservices.com") ||
    url.includes("adtrafficquality.google")
  ) {
    return; // let browser handle it
  }

  // 🔴 Already proxied — DO NOT rewrap
  if (url.includes("/scramjet/")) {
    return;
  }

  // FIXED: Added URL object so .hostname works below
  const urlObj = new URL(url);

  // Let TMDB images bypass Scramjet cleanly
  if (urlObj.hostname === 'image.tmdb.org') {
    // Return undefined to let browser handle fetch naturally
    return;
  }

  // FIXED: Removed the split syntax and combined into one respondWith
  event.respondWith((async () => {
    try {
      await scramjet.loadConfig();

      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }

      return fetch(event.request);
    } catch (err) {
      console.error('[Scramjet SW] Fatal error, resetting:', err);

      // HARD fallback — don't partially proxy
      return fetch(event.request);
    }
  })());
});
