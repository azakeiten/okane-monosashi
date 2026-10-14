// おかねの物差し：おつりチャレンジ。お札で払ったときのおつりを、硬貨とお札をえらんで作る（5回）
(() => {
  const D = window, { $, yen, esc, store } = D.OK;
  const box = $("chgBox"); if (!box) return;
  const MONEY = [5000, 1000, 500, 100, 50, 10, 5, 1];
  const ROUNDS = 5;
  const pool = D.ITEMS.filter((i) => i.p25 <= 9000);
  // 硬貨とお札の絵
  const coin = (v, size = 46) => {
    if (v >= 1000) return `<svg class="cg-bill" viewBox="0 0 76 40" width="${size * 1.6}" height="${size * 0.85}" aria-hidden="true"><rect x="1" y="1" width="74" height="38" rx="4" fill="${v === 5000 ? "color-mix(in srgb, var(--seg5) 35%, var(--card))" : "color-mix(in srgb, var(--cool) 30%, var(--card))"}" stroke="var(--ink)" stroke-width="1.6"/><circle cx="56" cy="20" r="10" fill="none" stroke="var(--ink)" stroke-width="1.2" opacity=".6"/><text x="22" y="25" text-anchor="middle" font-size="14" font-weight="900" fill="var(--ink)">${v.toLocaleString()}</text></svg>`;
    const C = { 500: ["#d9b44a", "#a8862c"], 100: ["#d6d8de", "#9aa0ad"], 50: ["#dfe1e6", "#9aa0ad"], 10: ["#c98652", "#94592e"], 5: ["#d9b44a", "#a8862c"], 1: ["#eef0f4", "#b4b8c2"] }[v];
    const hole = v === 50 || v === 5 ? `<circle cx="20" cy="20" r="4.2" fill="var(--card)" stroke="${C[1]}" stroke-width="1.2"/>` : "";
    return `<svg class="cg-coin" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="${C[0]}" stroke="${C[1]}" stroke-width="2"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="${C[1]}" stroke-width="1" opacity=".6"/>${hole}<text x="20" y="${hole ? 33 : 24.5}" text-anchor="middle" font-size="${hole ? 8 : v >= 100 ? 11 : 12}" font-weight="900" fill="#2b2b2b">${v}</text></svg>`;
  };
  const minCount = (n) => MONEY.reduce((a, v) => { a.c += Math.floor(a.r / v); a.r %= v; return a; }, { c: 0, r: n }).c;
  let round, stars, cur, tray, done;

  function newRound() {
    const it = pool[Math.floor(Math.random() * pool.length)];
    const pay = [1000, 5000, 10000].find((b) => b > it.p25);
    cur = { it, pay, change: pay - it.p25 }; tray = []; done = null; render();
  }
  function start() { round = 1; stars = 0; newRound(); }

  function render() {
    const sum = tray.reduce((a, b) => a + b, 0), c = cur;
    const best = store.get("chgBest", null);
    if (round > ROUNDS) {
      const rec = best == null || stars > best; if (rec) store.set("chgBest", stars);
      box.innerHTML = `<div class="cg-end">${D.OK.mascot ? D.OK.mascot(stars >= 12 ? "wow" : "smile", 64) : ""}<div><p class="cg-big">5回で <b>★${stars}</b> / ${ROUNDS * 3}${rec ? '<span class="newrec">新記録！</span>' : ""}</p>
        <p>${stars >= 13 ? "おつり名人！ 少ない枚数で、ぴったり作れました。" : "大きいお金から順に考えると、少ない枚数で作れるよ。"}</p>
        <button type="button" class="btn" id="cgAgain">もう一回</button></div></div>`;
      $("cgAgain").addEventListener("click", start); return;
    }
    box.innerHTML = `<div class="cg-top"><span class="cg-r">${round}回目 / ${ROUNDS}</span><span class="cg-s">★${stars}</span></div>
      <div class="cg-q"><div class="cg-item"><span class="cg-k">買うもの</span><b>${esc(c.it.name)}</b><span class="cg-u">${esc(c.it.unit)}</span><span class="cg-p">${yen(c.it.p25)}円</span></div>
        <div class="cg-pay"><span class="cg-k">はらったお金</span>${coin(c.pay, 40)}<span class="cg-p">${yen(c.pay)}円</span></div>
        <div class="cg-ask"><span class="cg-k">おつりは？</span><b>${done ? yen(c.change) + "円" : "？円"}</b></div></div>
      <div class="cg-tray" aria-label="おつりのトレイ">${tray.length ? tray.map((v, i) => `<button type="button" class="cg-t" data-i="${i}" aria-label="${v}円をもどす"${done ? " disabled" : ""}>${coin(v, 38)}</button>`).join("") : `<span class="cg-empty">下のお金を押して、おつりを作ろう</span>`}</div>
      <div class="cg-sum">トレイの合計：<b>${yen(sum)}円</b>　<small>${tray.length}枚</small></div>
      ${done ? `<div class="q-say">${D.OK.mascot ? D.OK.mascot(done.ok ? "wow" : "think", 44) : ""}<p>${done.msg}</p></div><button type="button" class="btn" id="cgNext">${round < ROUNDS ? "次の買い物へ" : "けっかを見る"}</button>`
        : `<div class="cg-bank">${MONEY.filter((v) => v < c.pay).map((v) => `<button type="button" class="cg-m" data-v="${v}" aria-label="${v}円を入れる">${coin(v)}</button>`).join("")}</div>
        <div class="cg-btns"><button type="button" class="btn ghost" id="cgClear">やりなおす</button><button type="button" class="btn" id="cgOk">これでOK</button></div>`}`;
    if (done) { $("cgNext").addEventListener("click", () => { round++; if (round > ROUNDS) render(); else newRound(); }); return; }
    $("cgClear").addEventListener("click", () => { tray = []; render(); });
    $("cgOk").addEventListener("click", check);
  }
  function check() {
    const sum = tray.reduce((a, b) => a + b, 0), c = cur, mn = minCount(c.change);
    if (sum !== c.change) { done = null; box.querySelector(".cg-sum").classList.add("ng"); box.querySelector(".cg-sum small").textContent = sum < c.change ? `あと${yen(c.change - sum)}円たりないよ` : `${yen(sum - c.change)}円多いよ`; return; }
    const got = tray.length === mn ? 3 : tray.length <= mn + 2 ? 2 : 1; stars += got;
    done = { ok: true, msg: `ぴったり！ ${yen(c.pay)}円 − ${yen(c.it.p25)}円 ＝ ${yen(c.change)}円。${got === 3 ? `いちばん少ない${mn}枚で作れたね。★3つ！` : `いちばん少ないのは${mn}枚。★${got}つ！`}` };
    render();
  }
  box.addEventListener("click", (e) => {
    const m = e.target.closest(".cg-m"); if (m && !done) { if (tray.length < 30) tray.push(+m.dataset.v); render(); return; }
    const t = e.target.closest(".cg-t"); if (t && !done) { tray.splice(+t.dataset.i, 1); render(); }
  });
  start();
})();
