// おかねの物差し：アプリとしてホーム画面に追加・オフラインで使う（GitHub版のページでだけ動く）
(() => {
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const secure = location.protocol === "https:" || location.hostname === "localhost";
  if (framed || !secure) return;
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) return;
  const box = document.getElementById("installBox"), btn = document.getElementById("installBtn"), txt = document.getElementById("installText");
  if (!box) return;
  const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  if (ios) {
    txt.innerHTML = "Safariの下にある<b>共有ボタン</b>（四角から矢印が出ているマーク）を押して、<b>「ホーム画面に追加」</b>をえらんでください。全画面で使えて、電波がないところでも動きます。";
    box.hidden = false;
  }
  // Android・パソコンのChromeなど：追加できるときだけボタンを出す
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; box.hidden = false; btn.hidden = false; });
  btn.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) {}
    deferred = null; box.hidden = true;
  });
  window.addEventListener("appinstalled", () => { box.hidden = true; });
})();
