foam.SCRIPT({
  name: 'BuildCachingServiceWorker',
  code: function() {
    const version = foam.poms[0].version;
    const file1 = `
// FOAM Caching Service Worker
//
// see https://developer.mozilla.org/en-US/docs/Web/API/Cache
// Caches foam-bin, manifest, style, and js requsts.

const CACHE_NAME = 'FOAM';
const TTL_KEY = 'foam-bin';
const BIN_NAME = 'foam-bin-${version}.js';

self.addEventListener("install", (event) => {
  self.console.log('install', CACHE_NAME);
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  self.console.log('activate', CACHE_NAME);
  event.waitUntil(clients.claim());
});

async function cacheThenNetwork(request) {
  var cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    self.console.log("cache hit", request.url, cachedResponse);
    return cachedResponse;
  }
  self.console.log("cache miss", request.url);
  // Call .clone() on the request since it might be used
  // in a call to cache.put() later on.
  // Both fetch() and cache.put() "consume" the request,
  // so make a copy.
  // (see https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
  return fetch(request.clone()).then((response) => {
    if ( response &&
         response.status < 400 &&
         response.headers.has("content-type") ) {
      cache.put(request.url, response.clone());
      if ( request.url.toString().indexOf(BIN_NAME) > 0 ) {
        // clear cache, we've received a new version
        // TODO: Cache cleanup UNTESTED
        cache.match(TTL_KEY).then((previous) => {
          if ( previous ) {
            // clear cache, we've received a new version
            self.console.log("cache clean", previous.url, request.url);
            caches.delete(CACHE_NAME).then((deleted) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(TTL_KEY, response.clone());
                cache.put(request.url, response.clone());
                return response;
              });
            });
          }
        });
      }
    } else {
      self.console.error("fetch failed", "invalid response", response);
    }
    return response;
  }).catch((error) => {
    self.console.error("fetch failed", request.url, error);
    throw error;
  });
}

self.addEventListener("fetch", (event) => {
    self.console.log("fetch", event.request.destination, event.request.url);
  if (
    event.request.method === "GET" && (
      event.request.destination === "json" ||
      event.request.destination === "manifest" ||
      event.request.destination === "script" ||
      event.request.destination === "style"
    )
  ) {
    self.console.log("fetching", event.request.destination, event.request.url);
    event.respondWith(cacheThenNetwork(event.request));
  }
});
    `;

    var dir = './build/webroot';
    var fs = require('fs');
    if ( ! fs.existsSync(dir) ) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(dir+'/CachingServiceWorker.js', file1);

    const file2 = `
// RegisterCachingServiceWorker
//
// Registers FOAM Caching Servicer Worker
// and requests the foam-bin 0

const BIN_NAME = 'foam-bin-${version}.js';

let resolve, reject;
globalThis.swPromise = new Promise((res, rej) => { resolve = res; reject = rej;});

if ( 'serviceWorker' in navigator ) {
  console.log('CachingServiceWorker registering');

  navigator.serviceWorker.register('/CachingServiceWorker.js', { scope: '/' }).then(
    reg => {
      console.log('CachingServiceWorker registered');
      let sw;
      if ( reg.active ) {
        console.log('active');
        sw = reg.active;
      }
      if ( reg.installing ) {
        console.log('installing');
        sw = reg.installing;
      }
      if ( reg.waiting ) {
        sw = reg.waiting;
        console.log('waiting');
      }

      var sc = document.createElement('script');
      sc.setAttribute('async', '');
      sc.setAttribute('src', BIN_NAME);
      sc.setAttribute('type', 'text/javascript');
      sc.setAttribute('flags', document.currentScript?.getAttribute('flags'));

      if ( sw ) {
        console.log("state", sw.state);
        if ( sw.state === 'activated') {
          document.head.appendChild(sc);
        } else {
          sw.addEventListener("statechange", (e) => {
            console.log("statechange", e.target.state);
            if ( sw.state === 'activated' ) {
              document.head.appendChild(sc);
            }
          });
        }
      }

      // // Causes the service worker to be updated if the CachingServiceWorker.js file changed
      // navigator.serviceWorker.ready.then(r => { resolve(r); }).catch(err => { reject(err); });
      // reg.update();
    },
    err => console.log('CachingServiceWorker registration failed:', err, err?.scope)
  );
}
`;
    fs.writeFileSync(dir+'/RegisterCachingServiceWorker-'+version+'.js', file2);
  }
});
