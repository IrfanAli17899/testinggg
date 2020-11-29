var staticAssets = [".", "/index.html", "/bikes.html", "/cars.html", "/fav.html", "/furniture.html",
  "/login.html", "/mobiles.html", "/register.html", "/myAds.html", "/post-Ad.html", "/realEstate.html", "/notification.html",
  "/electronicsAppliances.html","buy.html","/getFav/", "/javascript/ad.js", "/javascript/jquery.flexisel.js", "/javascript/jquery.min.js",
  "/css/animate.css", "/css/bootstrap.min.css", "/css/style.css"
]
self.addEventListener('install', (ev) => {
  console.log('installed');
  ev.waitUntil(
    caches.open("staticAssets-v2")
      .then((cache) => {
        cache.addAll(staticAssets)
        console.log("Added StaticAssets In Cache");
      })
  )
});
self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(keys.map((key) => {
          if (key !== 'staticAssets-v2' && key !== 'dynamicAssets-v2') {
            return caches.delete(key)
          }
        }))
      })
  )
})

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
   return ev.respondWith(cacheFirst(req));
  }else{
    return ev.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  let cacheRes = await caches.match(req);
  return cacheRes || networkFirst(req);
}

async function networkFirst(req) {
  const dynamicCache = await caches.open('dynamicAssets-v2');
  try {
    const networkResponse = await fetch(req);
    if(req.method=='GET'){
      dynamicCache.put(req, networkResponse.clone());
      return networkResponse;
    }else{
      return networkResponse;      
    }
  } catch (err) {
    const cacheResponse = await caches.match(req);
    return cacheResponse;
  }
}
