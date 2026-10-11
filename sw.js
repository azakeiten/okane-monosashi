// おかねの物差し：オフラインでも使えるようにする（GitHub版だけで動く）
// VERSION は dev/build.sh が書きかえる
const VERSION = "okane-20261012001725";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png",
  "okane-data.js", "okane-app.js", "okane-charts.js", "okane-map.js", "okane-kakei.js", "okane-big.js",
  "okane-me.js", "okane-tax.js", "okane-fx.js", "okane-diary.js", "okane-age.js", "okane-pwa.js", "okane-ux.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// まずネットから最新を取り、つながらないときはしまっておいたものを使う
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  e.respondWith(fetch(e.request).then((res) => {
    if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match("index.html"))));
});
