// おかねの物差し：ホームの「つづきから」。前に読んでいた章・進みぐあい・次のおすすめ
(() => {
  const D = window, { $, store, esc } = D.OK;
  const box = $("resume"); if (!box) return;
  const title = (id) => { const h = $(id) && $(id).querySelector(".ch-head h2"); if (!h) return ""; const c = h.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent.trim(); };
  const num = (id) => { const b = $(id) && $(id).querySelector(".rule-band span"); return b ? b.textContent : ""; };
  // スタンプの章の順番（スタンプラリーの並びと同じ）
  const order = () => [...document.querySelectorAll("#stampGrid .stamp")].map((a) => a.getAttribute("href").slice(1));

  // 読んでいる章を覚える（画面のまん中に1.2秒あったら）
  if ("IntersectionObserver" in window) {
    const timers = {};
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      const id = e.target.id;
      if (e.isIntersecting) timers[id] = setTimeout(() => { if (store.get("lastCh") !== id) { store.set("lastCh", id); } }, 1200);
      else clearTimeout(timers[id]);
    }), { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    order().forEach((id) => { const el = $(id); if (el) io.observe(el); });
  }

  function ring(n, all) {
    const r = 30, c = 2 * Math.PI * r, f = all ? n / all : 0;
    return `<svg class="rs-ring" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${r}" class="bg"/><circle cx="38" cy="38" r="${r}" class="fg" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 38 38)"/></svg>`;
  }
  function render() {
    const ids = order(), stamps = new Set(store.get("stamps", [])), badges = store.get("badges", []).length;
    const last = store.get("lastCh", null), got = ids.filter((id) => stamps.has(id)).length;
    // はじめての人には出さない
    if (!last && !got) { box.hidden = true; return; }
    box.hidden = false;
    const next = ids.find((id) => !stamps.has(id) && id !== last);
    const card = (id, k, btn, cls) => `<a class="rs-card ${cls}" href="#${id}"><span class="rs-k">${k}</span>
      <span class="rs-t"><span class="rs-n">${esc(num(id))}</span>${esc(title(id))}</span><span class="rs-go">${btn} →</span></a>`;
    box.innerHTML = `<div class="rs-prog"><div class="rs-ringwrap">${ring(got, ids.length)}<span class="rs-pct"><b>${got}</b>/${ids.length}</span></div>
        <div><span class="rs-hi">おかえりなさい</span><span class="rs-sub">スタンプ ${got}/${ids.length}・バッジ ${badges}/${D.OK.badgeTotal || 15}</span></div></div>
      ${last && $(last) ? card(last, "つづきから", "つづきを読む", "last") : ""}
      ${next ? card(next, "まだ読んでいない章", "読んでみる", "next") : `<a class="rs-card next" href="#stamps"><span class="rs-k">ぜんぶ読みました！</span><span class="rs-t">チャレンジバッジをあつめよう</span><span class="rs-go">バッジを見る →</span></a>`}`;
  }
  render();
  document.addEventListener("okane:stamp", render); document.addEventListener("okane:badge", render);
  // ホームにもどったときに、新しい内容にする
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (!h || h === "home") render(); });
  addEventListener("popstate", render);
  document.addEventListener("click", (e) => { const a = e.target.closest('a[href="#home"]'); if (a) setTimeout(render, 30); });
})();
