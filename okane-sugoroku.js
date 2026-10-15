// おかねの物差し：お金すごろく（2人であそぶ・ものさしくんとも対戦できる）。マスの値段は本物の統計
(() => {
  const D = window, { $, yen, esc, store } = D.OK;
  const box = $("sgBox"); if (!box) return;
  const P = (id) => D.ITEMS.find((i) => i.id === id).p25;
  const W = D.MINWAGE_2026.avg;
  // マス：t=見出し、v=お金の増減（関数でもよい）、d=ひとこと、ch=くわしい章
  const SQ = [
    { t: "スタート", v: 0, d: "おこづかい3,000円からスタート！" },
    { t: "おにぎりを2こ買う", v: -P("onigiri") * 2, d: `1こ${P("onigiri")}円（東京23区の平均）。`, ch: "hours" },
    { t: "お手伝いをした", v: 500, d: "おうちのお手伝いで、おこづかいをもらった。" },
    { t: "ノートを3さつ買う", v: -P("notebook") * 3, d: `1さつ${P("notebook")}円。2015年は141円だったので、10年で約1.5倍。`, ch: "rank" },
    { t: "カラオケ1時間", v: -P("karaoke"), d: `1人1時間${yen(P("karaoke"))}円（東京23区の平均）。`, ch: "rank" },
    { t: "お年玉をもらった", v: 5000, d: "大きなお金。使う分と、ためる分をわけよう。", ch: "save" },
    { t: "チョコとアイス", v: -(P("choco") + P("ice")), d: `板チョコ${P("choco")}円＋アイス${P("ice")}円。おやつは10年でとくに値上がりしたグループです。`, ch: "diary" },
    { t: "貯金箱に入れた", v: 0, save: 1000, d: "1,000円を貯金箱へ。ゴールで戻ってくるよ。", ch: "save" },
    { t: "消費税を考えよう", v: -1100, d: "1,100円の買い物。そのうち100円は消費税（10%）。", ch: "tax" },
    { t: "回転ずしで3皿", v: -P("sushi") * 3, d: `1皿${P("sushi")}円。外食の値段は、材料と人の給料で決まる。`, ch: "time" },
    { t: "フリマで売れた", v: 800, d: "使わなくなったおもちゃが売れた。売りたい人とほしい人がいれば、値段がつく。", ch: "time" },
    { t: "乾電池を買う", v: -P("battery"), d: `単3・4本で${P("battery")}円。`, ch: "hours" },
    { t: "円安で、外国のおかしが値上がり", v: -300, d: "1ドルの品物でも、円安だと多くの円が必要になる。", ch: "fx" },
    { t: "ボウリング1ゲーム", v: -P("bowling"), d: `1ゲーム${P("bowling")}円。`, ch: "rank" },
    { t: "アルバイト体験（3時間）", v: Math.round(W * 3), d: `最低賃金の全国平均（時給${yen(W)}円）×3時間。`, ch: "pay" },
    { t: "Tシャツを買う", v: -P("tshirt"), d: `子ども用1枚${yen(P("tshirt"))}円。`, ch: "rank" },
    { t: "落とし物をとどけた", v: 0, d: "お金は減らないけれど、いいことをした！" },
    { t: "牛丼とバーガー", v: -(P("gyudon") + P("burger")), d: `牛丼${P("gyudon")}円＋チーズバーガー${P("burger")}円。`, ch: "hours" },
    { t: "キャッシュレスで使いすぎ", v: -800, d: "見えないお金は使いすぎに注意。おこづかい帳で記録しよう。", ch: "diary" },
    { t: "ゴール！", v: 0, d: "貯金箱のお金も戻ってきた。のこったお金をくらべよう。" },
  ];
  const N = SQ.length - 1, START = 3000;
  let pl, turn, msg, rolling = false, vsCPU = store.get("sgCPU", true);
  const NAMES = () => [store.get("cardName", "") || "きみ", vsCPU ? "ものさしくん" : "ともだち"];
  function start() { pl = [0, 1].map(() => ({ pos: 0, money: START, bank: 0, done: false })); turn = 0; msg = "サイコロをふって、すすもう！"; render(); }

  const signed = (v) => v > 0 ? `+${yen(v)}円` : v < 0 ? `−${yen(-v)}円` : "±0円";
  function render() {
    const nm = NAMES(), over = pl.every((p) => p.done);
    const cells = SQ.map((s, i) => { const v = s.save ? -s.save : s.v;
      return `<li class="sg-c ${v > 0 ? "plus" : v < 0 ? "minus" : ""}${i === 0 || i === N ? " end" : ""}"><span class="sg-n">${i}</span><b>${esc(s.t)}</b><span class="sg-v">${i && i < N ? signed(v) : ""}</span>
        <span class="sg-pk">${pl.map((p, k) => p.pos === i ? `<i class="p${k}" title="${esc(nm[k])}">${k ? (vsCPU && D.OK.mascot ? D.OK.mascot("smile", 22) : "B") : "A"}</i>` : "").join("")}</span></li>`; }).join("");
    const win = over ? (pl[0].money === pl[1].money ? -1 : pl[0].money > pl[1].money ? 0 : 1) : null;
    box.innerHTML = `<div class="sg-top"><div class="sg-mode chips"><button type="button" class="chip" data-m="cpu" aria-pressed="${vsCPU}">ものさしくんと対戦</button><button type="button" class="chip" data-m="two" aria-pressed="${!vsCPU}">2人であそぶ</button></div>
        <div class="sg-pl">${pl.map((p, k) => `<div class="sg-p p${k}${turn === k && !over ? " now" : ""}"><span>${esc(nm[k])}</span><b>${yen(p.money)}円</b>${p.bank ? `<small>貯金箱 ${yen(p.bank)}円</small>` : ""}</div>`).join("")}</div></div>
      <ol class="sg-board">${cells}</ol>
      <div class="sg-msg" aria-live="polite">${over ? `<b>${win < 0 ? "引き分け！" : `${esc(nm[win])}の勝ち！`}</b> ${esc(nm[0])} ${yen(pl[0].money)}円、${esc(nm[1])} ${yen(pl[1].money)}円。` : msg}</div>
      <div class="sg-btns">${over ? `<button type="button" class="btn" id="sgAgain">もう一回</button>` : `<button type="button" class="btn" id="sgRoll"${rolling || (vsCPU && turn === 1) ? " disabled" : ""}><span class="sg-dice" id="sgDice">⚄</span> ${esc(nm[turn])}がサイコロをふる</button>`}</div>`;
    if (over) $("sgAgain").addEventListener("click", start); else $("sgRoll").addEventListener("click", roll);
  }
  function roll() {
    if (rolling) return; rolling = true; render();
    const k = turn, n = 1 + Math.floor(Math.random() * 6);
    let t = 0; const iv = setInterval(() => { const d = $("sgDice"); if (d) d.textContent = "⚀⚁⚂⚃⚄⚅"[Math.floor(Math.random() * 6)]; if (++t > 6) { clearInterval(iv); land(k, n); } }, 70);
  }
  function land(k, n) {
    const p = pl[k], nm = NAMES(); p.pos = Math.min(N, p.pos + n);
    const s = SQ[p.pos];
    if (s.save) { const sv = Math.min(s.save, p.money); p.money -= sv; p.bank += sv; } else p.money = Math.max(0, p.money + s.v);
    if (p.pos === N) { p.money += p.bank; p.bank = 0; p.done = true; }
    msg = `<b>${esc(nm[k])}は ${"⚀⚁⚂⚃⚄⚅"[n - 1]} ${n}！</b> 「${esc(s.t)}」 ${s.save ? "" : signed(s.v)}<br><span>${esc(s.d)}</span>${s.ch && $(s.ch) ? ` <a href="#${s.ch}">→ くわしく</a>` : ""}`;
    rolling = false;
    const other = 1 - k; if (!pl[other].done) turn = other;
    render();
    if (vsCPU && turn === 1 && !pl[1].done && !pl.every((q) => q.done)) setTimeout(roll, 1100);
  }
  box.addEventListener("click", (e) => { const m = e.target.closest("[data-m]"); if (!m) return; vsCPU = m.dataset.m === "cpu"; store.set("sgCPU", vsCPU); start(); });
  start();
})();
