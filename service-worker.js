/* =====================================================================
   service-worker.js
   PWAとして「ホーム画面に追加」「オフラインでも開ける」ようにするための仕組み。
   今は最小限の内容（アプリ本体のファイルをキャッシュするだけ）。
   キャッシュする対象は、機能を増やすたびにここに追記していく。
===================================================================== */

const CACHE_NAME = "illust-manager-v5"; // ファイルを更新したらこの数字を上げる
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/storage.js",
  "./js/utils.js",
  "./js/modal.js",
  "./js/ideas.js",
  "./js/production.js",
  "./js/router.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// インストール時：アプリの骨組みファイルをキャッシュしておく
self.addEventListener("install", event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// 有効化時：古いバージョンのキャッシュを削除する
self.addEventListener("activate", event=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// リクエスト時：キャッシュにあればそれを返し、無ければネットワークから取得する
self.addEventListener("fetch", event=>{
  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request))
  );
});
