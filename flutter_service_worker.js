'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "55f91eb62b3af31b0c0aa2f46bb882d1",
"assets/assets/coin-anh.png": "0269f631c9ca3114df0f033c982a0e64",
"assets/assets/coin-chu.png": "26328b45ce9187d35407d3ea79064f29",
"assets/assets/coin.png": "47de7c44a97e2e21c2b12e2e58703c2d",
"assets/assets/intro_1.jpg": "edd2441151050978d10ce26a51df8a05",
"assets/assets/intro_2.jpg": "e1cd5d94656e27fe112ee6955b4907c7",
"assets/assets/intro_3.jpg": "45771e3dfce493caaef9d8cb9de5e091",
"assets/assets/intro_4.jpg": "e6973204563c604f244ce44b99dfdd1f",
"assets/assets/intro_5.jpg": "6675eafa1aa0ebe86158b927695b6464",
"assets/assets/intro_6.jpg": "ff81293d9d9385fe19a274adcae93b38",
"assets/assets/nghi.png": "a77992f80e098551622cb1818c63dbf4",
"assets/assets/nghiam-dong.png": "b46341ffa004a18ceb3f418c67a4c5f5",
"assets/assets/nghiam.png": "da5f259e51b37bfb75c877c3d82a379e",
"assets/assets/nghiduong-dong.png": "318f20e9e55430e523246882885b8e7d",
"assets/assets/nghiduong.png": "c68fa7cdd67b8954a1efbd3b2e6fe769",
"assets/assets/page.jpg": "29d90807ca9e2babd9ec177b013dccc3",
"assets/assets/splash.jpg": "eee9b6c0f109872eea42273552dcf545",
"assets/FontManifest.json": "36704e1540823347de0b84d08238471a",
"assets/fonts/AveresTitleRoman-Regular.otf": "27897f53fe286343ac2f1642694e575b",
"assets/fonts/ChromoxomePro-ExtraLight.otf": "54e30a034f045c08a4cc71418c038ce8",
"assets/fonts/ChromoxomePro-ExtraLight.ttf": "d41db4cce5219d50ac2ef850af730dc0",
"assets/fonts/JournalSansNew-Display.otf": "4d3e839d48f9c00a40d7e2c9538c1cba",
"assets/fonts/JournalSansNew-Italic.otf": "9a950aa483235d0ab3d06036f9901440",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/lang/en.json": "bc8883285c86690df3a9f96f2b6a8abd",
"assets/lang/vi.json": "bc8883285c86690df3a9f96f2b6a8abd",
"assets/NOTICES": "39c4f1de65538586386f5135f798adc5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "831eb40a2d76095849ba4aecd4340f19",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "a126c025bab9a1b4d8ac5534af76a208",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "d80ca32233940ebadc5ae5372ccd67f9",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "c0c7e7d9ee86803da18c730817528c78",
"/": "c0c7e7d9ee86803da18c730817528c78",
"main.dart.js": "132a8fe55473994f84ffc80d89dfce2a",
"manifest.json": "9e076ebaaa361410cbee51a92f26afbc",
"version.json": "abd09451aa693f83cd1e7624097d1006"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
