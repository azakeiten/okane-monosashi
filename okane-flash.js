// おかねの物差し：ことばカード。ことば辞典のことばを、めくって覚えるカードにする
(() => {
  const D = window, { $, esc, store } = D.OK;
  const box = $("flashBox"); if (!box) return;
  // ことば辞典の中身を、そのまま使う（辞典にことばを足すと、カードもふえる）
  const W = [...document.querySelectorAll("#wordGrid .word")].map((w) => ({ w: w.querySelector(".w").textContent, r: (w.querySelector(".r") || {}).textContent || "", p: w.querySelector("p").textContent, ex: (w.querySelector(".ex") || {}).textContent || "" }));
  if (!W.length) return;
  let known = new Set(store.get("flashKnown", []));
  let deck, i, flipped;
  const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  function start(onlyNew) {
    const pool = W.filter((x) => !onlyNew || !known.has(x.w));
    deck = shuffle(pool.length ? pool : W.slice()); i = 0; flipped = false; render();
  }
  function render() {
    const n = known.size, all = W.length;
    if (i >= deck.length) {
      box.innerHTML = `<div class="fc-end">${D.OK.mascot ? D.OK.mascot(n === all ? "wow" : "smile", 56) : ""}<div><p class="fc-big">${n === all ? "ぜんぶ覚えた！ ことば名人です。" : `おぼえたことば：<b>${n}</b> / ${all}`}</p>
        <div class="fc-btns"><button type="button" class="btn" data-a="new"${n === all ? " disabled" : ""}>まだのことばだけ、もう一度</button><button type="button" class="btn ghost" data-a="all">ぜんぶ、もう一度</button><button type="button" class="btn ghost" data-a="reset">記録を消す</button></div></div></div>`;
      return;
    }
    const c = deck[i];
    box.innerHTML = `<div class="fc-top"><span>${i + 1} / ${deck.length}まい</span><span class="fc-known">おぼえた ${n} / ${all}</span></div>
      <button type="button" class="fc-card${flipped ? " flip" : ""}" data-a="flip" aria-label="${flipped ? "ことばの面にもどす" : "めくって意味を見る"}">
        <span class="fc-face fc-front"><b>${esc(c.w)}</b>${c.r ? `<small>${esc(c.r)}</small>` : ""}<em>押してめくる</em></span>
        <span class="fc-face fc-back"><b>${esc(c.w)}</b><span>${esc(c.p)}</span>${c.ex ? `<small>${esc(c.ex)}</small>` : ""}</span>
      </button>
      <div class="fc-btns">${flipped ? `<button type="button" class="btn ghost" data-a="again">もう一度</button><button type="button" class="btn" data-a="ok">おぼえた！</button>` : `<button type="button" class="btn" data-a="flip">めくる</button>`}</div>`;
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a;
    if (a === "flip") { flipped = !flipped; render(); return; }
    if (a === "ok" || a === "again") {
      const c = deck[i]; if (a === "ok") known.add(c.w); else { known.delete(c.w); deck.push(c); }
      store.set("flashKnown", [...known]); i++; flipped = false; render(); return;
    }
    if (a === "new") start(true); else if (a === "all") start(false); else if (a === "reset") { known = new Set(); store.set("flashKnown", []); start(false); }
  });
  start(true);
})();
