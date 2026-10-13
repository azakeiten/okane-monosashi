// おかねの物差し：買い物かご。同じかごを買うのに、10年前と今で何分はたらく必要があるか
(() => {
  const D = window, { $, yen, esc, store, hmText, hmHTML, sgn } = D.OK;
  const W15 = D.MINWAGE[2015], W25 = D.MINWAGE[2025], WR = W25 / W15;
  const BY = Object.fromEntries(D.ITEMS.map((i) => [i.id, i]));
  const PRESETS = [
    { t: "朝ごはん", c: { bread: 1, egg: 1, milk: 1, banana: 1 } },
    { t: "おやつ", c: { choco: 1, chips: 1, gum: 1, pudding: 1 } },
    { t: "家族の買い物", c: { rice: 1, egg: 2, milk: 2, onion: 1, natto: 2, bread: 1 } },
    { t: "外食の日", c: { gyudon: 1, burger: 1, coffee: 2 } },
    { t: "あそびの日", c: { karaoke: 2, bowling: 2, water: 1 } },
  ];
  let cart = store.get("basket", null) || { ...PRESETS[0].c };

  const presets = $("bkPresets"), shelf = $("bkShelf"), out = $("bkResult");
  presets.innerHTML = PRESETS.map((p, i) => `<button type="button" class="chip" data-p="${i}">${p.t}</button>`).join("") +
    `<button type="button" class="chip" data-p="clear">からにする</button>`;
  shelf.innerHTML = Object.entries(D.GROUPS).map(([g, gt]) => `<div class="bk-g"><div class="bk-gt">${gt}</div><div class="bk-items">` +
    D.ITEMS.filter((i) => i.g === g).map((i) => `<button type="button" class="bk-it" data-id="${i.id}" title="${esc(i.unit)}"><span class="bk-n">${esc(i.name)}</span><span class="bk-p">${yen(i.p25)}円</span><span class="bk-c" aria-hidden="true"></span></button>`).join("") +
    `</div></div>`).join("");

  const add = (id, d) => { const n = (cart[id] || 0) + d; if (n <= 0) delete cart[id]; else cart[id] = Math.min(n, 20); save(); };
  const save = () => { store.set("basket", cart); render(); };
  presets.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    cart = b.dataset.p === "clear" ? {} : { ...PRESETS[+b.dataset.p].c }; save();
  });
  shelf.addEventListener("click", (e) => { const b = e.target.closest(".bk-it"); if (b) add(b.dataset.id, 1); });
  out.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) add(b.dataset.id, +b.dataset.d); });

  function render() {
    const ids = Object.keys(cart).filter((id) => BY[id]);
    [...shelf.querySelectorAll(".bk-it")].forEach((b) => {
      const n = cart[b.dataset.id] || 0;
      b.classList.toggle("on", n > 0); b.querySelector(".bk-c").textContent = n ? "×" + n : "";
      b.setAttribute("aria-label", `${BY[b.dataset.id].name}をかごに入れる${n ? `（今${n}個）` : ""}`);
    });
    const now = JSON.stringify(cart);
    [...presets.children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p !== "clear" && JSON.stringify(PRESETS[+b.dataset.p].c) === now)));
    if (!ids.length) { out.innerHTML = `<div class="bk-empty">${D.OK.mascot("think", 56)}かごは、からっぽです。<br>棚の品物を押して、かごに入れてみよう。</div>`; return; }

    const t15 = ids.reduce((s, id) => s + BY[id].p15 * cart[id], 0), t25 = ids.reduce((s, id) => s + BY[id].p25 * cart[id], 0);
    const h15 = t15 / W15, h25 = t25 / W25, diff = (h25 - h15) * 60, max = Math.max(h15, h25);
    const pr = (t25 / t15 - 1) * 100, wr = (WR - 1) * 100;
    const kind = diff > 0.5 ? "hard" : diff < -0.5 ? "easy" : "even";
    const verdict = kind === "hard"
      ? `今のほうが<b>${hmText(diff / 60)}長く</b>はたらかないと買えません。`
      : kind === "easy" ? `今のほうが<b>${hmText(-diff / 60)}短く</b>はたらけば買えます。` : `10年前と今で、はたらく時間はほとんど同じです。`;
    const why = kind === "hard"
      ? `かごの値段の上がり方（${sgn(pr)}）が、最低賃金の上がり方（${sgn(wr)}）より大きかったからです。`
      : kind === "easy" ? `最低賃金の上がり方（${sgn(wr)}）が、かごの値段の上がり方（${sgn(pr)}）より大きかったからです。` : `値段と最低賃金が、同じくらい上がりました。`;
    const bar = (y, t, h, w, cls) => `<div class="bk-row ${cls}"><div class="bk-y">${y}年<small>時給${yen(w)}円</small></div>
      <div class="bk-track"><i style="width:${(h / max) * 100}%"></i></div><div class="bk-v"><b>${hmHTML(h)}</b><small>${yen(t)}円</small></div></div>`;
    const rows = ids.map((id) => {
      const it = BY[id], r = it.p25 / it.p15, harder = r > WR;
      return `<li><span class="bk-ln"><span>${esc(it.name)}${it.n ? "<sup>※</sup>" : ""}</span><small>${esc(it.unit)}</small></span>
        <span class="bk-lp">${yen(it.p15)}→${yen(it.p25)}円</span>
        <span class="bk-tag ${harder ? "hard" : "easy"}">${harder ? "きつくなった" : "楽になった"}</span>
        <span class="bk-q"><button type="button" data-id="${id}" data-d="-1" aria-label="${esc(it.name)}を1つへらす">−</button><b>${cart[id]}</b><button type="button" data-id="${id}" data-d="1" aria-label="${esc(it.name)}を1つふやす">＋</button></span></li>`;
    }).join("");
    out.innerHTML = `<div class="bk-sum ${kind}">
        <div class="bk-k">このかごを買うのに、最低賃金ではたらく時間</div>
        ${bar(2015, t15, h15, W15, "old")}${bar(2025, t25, h25, W25, "new")}
        <p class="bk-verdict">${verdict}<br><span>${why}</span></p>
      </div>
      <ul class="bk-list" aria-label="かごの中身">${rows}</ul>
      <p class="bk-hint">「きつくなった」は、その品物の値段が最低賃金（${(WR).toFixed(2)}倍）より大きく上がったもの。何を買うかで、答えが変わります。</p>`;
  }
  render();
})();
