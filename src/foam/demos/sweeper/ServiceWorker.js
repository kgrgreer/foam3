console.log('Starting ServiceWorker');

const CACHE_NAME = "SweeperCache_1";
const RESOURCES  = [
  "/foam3/src/foam/demos/sweeper/RegisterServiceWorker.js",
  "/foam3/src/foam/demos/sweeper/sweep_min3.html",
  "/foam3/src/foam/demos/sweeper/foam-bin-3.js"
];

async function preCache() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(RESOURCES);
}

self.addEventListener("install", event => {
  console.log("Service worker installed");
  event.waitUntil(preCache());
});

self.addEventListener("activate", event => {
  console.log("Service worker activated");
});
