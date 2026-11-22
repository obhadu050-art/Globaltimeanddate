const CACHE_NAME = "gtad-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/index.html", "/styles.css", "/app.js"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;
      return fetch(e.request).catch(() => caches.match("/index.html"));
    })
  );
});
