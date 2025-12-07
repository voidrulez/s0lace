importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// Only proxy requests that MATCH /scramjet/*
// Do NOT touch posters, TMDB images, or other HTTP requests.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/scramjet/")) {
    event.respondWith(
      (async () => {
        await scramjet.loadConfig();
        return scramjet.fetch(event);
      })()
    );
    return;
  }

  // everything else → normal
  event.respondWith(fetch(event.request));
});
