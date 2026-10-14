// おかねの物差し：ホームの「あそんで学ぶ 体験コーナー」。章の中のゲームや動かせる図を、1か所にあつめる
(() => {
  const D = window, { $, esc, icon } = D.OK;
  const box = $("hubGrid"); if (!box) return;
  const KIND = { "ゲーム": "game", "なぜなに相談室": "read", "図で見よう": "read", "お金の歴史": "read" }; // ほかは「動かしてためす」
  const plain = (el) => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent.trim(); };
  const items = [...document.querySelectorAll("section.ch .bk-head")].map((h) => {
    const blk = h.parentElement, s = blk.closest("section.ch"), t = h.querySelector("h3"), b = h.querySelector(".bk-badge"), n = s.querySelector(".rule-band span");
    const badge = b ? b.textContent : "やってみよう";
    return { blk, id: s.id, no: n ? n.textContent : "", badge, kind: KIND[badge] || "move",
      title: t.dataset.tag || plain(t).split("：")[0].replace(/[？?]$/, ""), desc: plain(h.querySelector("p")).split("。")[0] + "。" };
  });
  // 「みんなでクイズ」は、クイズの章のボタンから開く
  if ($("bigQuizBtn")) items.push({ id: "quiz", no: "15", badge: "教室で", kind: "game", title: "みんなでクイズ", desc: "電子黒板やプロジェクターに、1問ずつ大きく出せます。", open: () => $("bigQuizBtn").click() });
  const KN = { all: "すべて", game: "ゲーム", move: "動かしてためす", read: "見て・読んで学ぶ" };
  let kind = "all";
  $("hubCount").textContent = items.length;
  $("hubTabs").innerHTML = Object.entries(KN).map(([k, t]) => `<button type="button" class="chip" data-k="${k}">${t}<span class="num">${k === "all" ? items.length : items.filter((x) => x.kind === k).length}</span></button>`).join("");
  function render() {
    [...$("hubTabs").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === kind)));
    box.innerHTML = items.map((x, i) => kind === "all" || x.kind === kind ? `<a class="hub-c ${x.kind}" href="#${x.id}" data-i="${i}">
      <span class="hub-ic">${icon(x.id, 22)}</span><span class="hub-b">${esc(x.badge)}</span><b>${esc(x.title)}</b><span class="hub-d">${esc(x.desc)}</span><span class="hub-no">${x.no}章へ →</span></a>` : "").join("");
  }
  $("hubTabs").addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (b) { kind = b.dataset.k; render(); } });
  box.addEventListener("click", (e) => {
    const a = e.target.closest(".hub-c"); if (!a) return; const x = items[+a.dataset.i];
    // 章の画面に移ったあと、そのコーナーまでスクロールして光らせる
    setTimeout(() => {
      if (x.open) { x.open(); return; }
      x.blk.scrollIntoView({ block: "start", behavior: "instant" }); scrollBy({ top: -90, behavior: "instant" });
      x.blk.classList.add("flash"); setTimeout(() => x.blk.classList.remove("flash"), 2400);
    }, 120);
  });
  render();
})();
