// おかねの物差し：クイズ（5つのモード・いちばんよかった点数を記録）
(() => {
  const D = window, { $, yen, esc, store, sgn, cpiAt, hmText } = D.OK;
  const box = $("quizBox");
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rnd(arr.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b / a - 1) * 100;
  const N = 5;

  // それぞれのモードは「問題を1つ作る」関数。{ q, opts:[{t,s}], ans, why }
  const MODES = {
    rise: { t: "値上がりはどっち？", d: "10年間で、値上がりの割合が大きいのは？", make(used) {
      const pool = D.ITEMS.filter((i) => !i.n && !used.has(i.id)).map((i) => ({ ...i, c: pct(i.p15, i.p25) }));
      for (let g = 0; g < 300; g++) {
        const a = pick(pool), b = pick(pool);
        if (a.id === b.id || Math.abs(a.c - b.c) < 12) continue;
        used.add(a.id); used.add(b.id);
        return { q: "2015年から2025年までに、値上がりの割合が大きいのはどっち？", opts: [a, b].map((x) => ({ t: x.name, s: x.unit, r: `${yen(x.p15)}円 → ${yen(x.p25)}円（${sgn(x.c)}）` })), ans: a.c > b.c ? 0 : 1, why: `${(a.c > b.c ? a : b).name}のほうが大きく値上がりしました。` };
      }
    } },
    hours: { t: "何時間はたらく？", d: "あなたの時給で、買うのにかかる時間は？", make(used) {
      const pool = D.ITEMS.filter((i) => !used.has(i.id) && i.p25 >= 400);
      const it = pick(pool); used.add(it.id);
      const w = D.OK.wage(), h = it.p25 / w;
      const fmt = (x) => x >= 10 ? `約${Math.round(x)}時間` : hmText(x);
      const wrong = shuffle([0.4, 0.6, 1.7, 2.5]).slice(0, 2).map((k) => h * k);
      const all = shuffle([h, ...wrong]);
      return { q: `時給${yen(w)}円ではたらくと、「${it.name}（${it.unit}・${yen(it.p25)}円）」を買うには、何時間かかる？`, opts: all.map((x) => ({ t: fmt(x) })), ans: all.indexOf(h), why: `${yen(it.p25)}円 ÷ 時給${yen(w)}円 ＝ ${fmt(h)}です。` };
    } },
    map: { t: "日本地図クイズ", d: "最低賃金や物価が高いのはどっちの県？", make(used) {
      const kind = pick(["wage", "rpi"]);
      const v = kind === "wage" ? D.PREF_WAGE : D.RPI_TOTAL, min = kind === "wage" ? 25 : 1.5;
      for (let g = 0; g < 300; g++) {
        const a = rnd(47), b = rnd(47);
        if (a === b || used.has(a) || used.has(b) || Math.abs(v[a] - v[b]) < min) continue;
        used.add(a); used.add(b);
        const f = (i) => kind === "wage" ? `${yen(v[i])}円` : `${v[i].toFixed(1)}`;
        return { q: kind === "wage" ? "2026年度の最低賃金が高いのは、どっちの県？" : "くらし全体の物価（全国平均＝100）が高いのは、どっちの県？", opts: [a, b].map((i) => ({ t: D.OK.prefName(i), r: f(i) })), ans: v[a] > v[b] ? 0 : 1, why: `${D.OK.prefName(v[a] > v[b] ? a : b)}のほうが高くなっています。` };
      }
    } },
    past: { t: "昔の値段クイズ", d: "今の1,000円の買い物、昔ならいくら？", make(used) {
      let y; do { y = 1975 + rnd(36); } while (used.has(y)); used.add(y);
      const p = Math.round(1000 * cpiAt("総合", y) / 100 / 10) * 10;
      const w = shuffle([0.6, 0.75, 1.25, 1.45]).slice(0, 2).map((k) => Math.round(p * k / 10) * 10);
      const all = shuffle([p, ...w.filter((x) => x !== p && x !== 1000)]);
      while (all.length < 3) all.push(Math.round(p * 0.5 / 10) * 10);
      return { q: `今（2025年）なら1,000円の買い物は、${y}年ならだいたいいくら？`, opts: all.map((x) => ({ t: `${yen(x)}円` })), ans: all.indexOf(p), why: `${y}年の物価指数は${cpiAt("総合", y).toFixed(1)}（2025年＝100）なので、約${yen(p)}円です。` };
    } },
    idea: { t: "しくみクイズ", d: "税金・円安・給料のしくみ、わかるかな？", make(used) {
      const pool = IDEAS.map((x, k) => k).filter((k) => !used.has("i" + k)); if (!pool.length) return null;
      const k = pick(pool), x = IDEAS[k]; used.add("i" + k);
      const all = shuffle(x.o.map((t, j) => ({ t, ok: j === 0 })));
      return { q: x.q, opts: all.map((o) => ({ t: o.t })), ans: all.findIndex((o) => o.ok), why: x.why, link: x.ch };
    } },
  };
  // しくみクイズの問題（答えは o の1つめ）。数字は okane-data.js から
  const T = D.TAXREV, cho = (v) => (v / 1e12).toFixed(1) + "兆円", big = (id) => D.BIG.find((b) => b.id === id);
  const IDEAS = [
    { q: "おにぎりをお店で買って、持ち帰るときの消費税は？", o: ["8%", "10%", "5%"], why: "食べ物や飲み物（お酒と外食をのぞく）は「軽減税率」で8%です。", ch: "tax" },
    { q: "ハンバーガーを、お店の中で食べるときの消費税は？", o: ["10%", "8%", "0%"], why: "お店の中で食べると「外食」になるので10%。持ち帰れば8%です。", ch: "tax" },
    { q: "消費税10%のうち、国の分はどれだけ？", o: ["7.8%", "2.2%", "10%ぜんぶ"], why: "7.8%が国、2.2%が都道府県と市区町村の分です。", ch: "tax" },
    { q: `国の税金の収入（${T.note}）で、いちばん多いのは？`, o: ["消費税", "所得税", "法人税"], why: `消費税${cho(T.consumption)}、所得税${cho(T.income)}、法人税${cho(T.corporate)}。消費税がいちばん多くなっています。`, ch: "tax" },
    { q: "家計・会社・国のあいだを、お金が回っていくことを何という？", o: ["経済の循環", "物価", "為替"], why: "買い物の代金は会社へ、給料は家計へ、税金は国へ。お金はぐるぐるめぐっています。", ch: "tax" },
    { q: "給料が3%増えて、物価が4%上がった。買える物は？", o: ["少しへる", "少しふえる", "変わらない"], why: "金額（名目）は増えても、物価の上がり方のほうが大きいので、買える量（実質）はへります。", ch: "race" },
    { q: "物価が上がり続けることを何という？", o: ["インフレ", "デフレ", "円高"], why: "上がり続けるのがインフレ、下がり続けるのがデフレです。", ch: "words" },
    { q: "1ドル100円が、1ドル150円になった。これは？", o: ["円安", "円高", "どちらでもない"], why: "1ドルを買うのに、前より多くの円が必要になりました。円の値打ちが下がったので「円安」です。", ch: "fx" },
    { q: "円安になると、外国から買う物（輸入品）の値段は？", o: ["上がりやすい", "下がりやすい", "変わらない"], why: "同じ1ドルの品物を買うのに、より多くの円を払うことになるからです。", ch: "fx" },
    { q: "給料から、税金や保険料が引かれたあとの金額を何という？", o: ["手取り", "額面", "時給"], why: "会社が決めた金額が額面、引かれたあと口座に入るのが手取りです。", ch: "pay" },
    { q: `国の予算（${big("budget").short}）で、いちばん多い使い道は？`, o: ["社会保障（年金・医療など）", "国債費（借金の返済）", "公共事業（道路など）"], why: `社会保障が${big("social").short}でいちばん多く、次が国債費の${big("debtpay").short}です。`, ch: "big" },
    { q: "物価が毎年2%上がると、値段が2倍になるのは約何年後？", o: ["約36年後", "約72年後", "約10年後"], why: "72の法則で、72÷2＝36年。2%は日本銀行が目標にしている上がり方です。", ch: "save" },
    { q: "最低賃金は、どこごとに決まっている？", o: ["都道府県ごと", "市区町村ごと", "全国で1つ"], why: `都道府県ごとに毎年決まります。2026年度は${yen(D.MINWAGE_2026.min)}円から${yen(D.MINWAGE_2026.max)}円まで差があります。`, ch: "map" },
    { q: "使ったお金のうち、食べ物に使った割合を何という？", o: ["エンゲル係数", "消費者物価指数", "相関係数"], why: "食べ物は節約しにくいので、物価が上がると高くなりやすい数字です。", ch: "kakei" },
    { q: "お金の単位「円」が生まれたのは、いつ？", o: ["明治時代（1871年）", "江戸時代（1601年）", "昭和時代（1950年）"], why: "1871年の新貨条例で「円・銭・厘」が決まりました。江戸時代は小判などの「両」が使われていました。", ch: "money" },
    { q: "お札（日本銀行券）を発行しているのは？", o: ["日本銀行", "造幣局", "銀行ならどこでも"], why: "お札は日本銀行が発行し、国立印刷局が印刷します。硬貨は国が発行し、造幣局が作っています。", ch: "money" },
    { q: "「貨」「財」「買」など、お金に関係する漢字に入っている部分は？", o: ["貝", "金", "米"], why: "大昔、貝がらがお金の代わりに使われていたなごりです。", ch: "money" },
    { q: `国に入ってくるお金（${D.BUDGET ? D.BUDGET.label : "令和8年度予算"}）のうち、借金（公債金）はどれくらい？`, o: ["約4分の1", "約10分の1", "約半分"], why: "1万円にちぢめると2,419円が借金です。税金だけでは足りない分を、国債でおぎなっています。", ch: "big" },
    { q: "国から都道府県や市町村に配る「地方交付税」は、何のため？", o: ["どこに住んでも同じくらいのサービスを受けられるように", "国の借金を返すため", "外国を助けるため"], why: "税金が集まりやすい地域と、そうでない地域の差をならすためのお金です。", ch: "big" },
    { q: "2025年、払ったお金のうちキャッシュレスはどれくらい？（経済産業省の国内指標）", o: ["約6割（58.0%）", "約2割（20%）", "ほぼぜんぶ（95%）"], why: "2010年は16.6%だったので、15年で約3.5倍にふえました。", ch: "money" },
    { q: "キャッシュレスで払ったお金で、いちばん多い方法は？（2025年）", o: ["クレジットカード", "コード決済（QRコード）", "電子マネー"], why: "金額では82.7%がクレジットカード。コード決済は10.2%です。", ch: "money" },
    { q: "お店やさんで「売り上げ − 材料代」がマイナスになることを何という？", o: ["赤字", "黒字", "利息"], why: "もうけが出るのが黒字、材料代などのほうが多いのが赤字です。", ch: "time" },
  ];

  let mode = store.get("quizMode", "rise"), qs = [], qi = 0, res = [], best = store.get("quizBest", {});
  function start(m) {
    mode = m; store.set("quizMode", m);
    const used = new Set(); qs = [];
    for (let k = 0; k < N; k++) { const q = MODES[m].make(used); if (q) qs.push(q); }
    qi = 0; res = []; render();
  }
  const dots = () => `<div class="dots" aria-hidden="true">${qs.map((_, i) => `<i class="${res[i] || ""}${i === qi && !res[i] ? " now" : ""}"></i>`).join("")}</div>`;
  const modeBar = () => `<div class="quiz-modes" role="tablist" aria-label="クイズのしゅるい">${Object.entries(MODES).map(([k, m]) => `<button type="button" role="tab" class="qm" data-m="${k}" aria-selected="${k === mode}"><b>${m.t}</b><span>${best[k] != null ? `ベスト ${best[k]}/${N}` : "まだ"}</span></button>`).join("")}</div>`;
  function bindModes() { box.querySelectorAll(".qm").forEach((b) => b.addEventListener("click", () => start(b.dataset.m))); }

  function render() {
    if (qi >= qs.length) {
      const ok = res.filter((r) => r === "ok").length, prev = best[mode];
      const rec = prev == null || ok > prev;
      if (rec) { best[mode] = ok; store.set("quizBest", best); }
      const msg = ok === N ? "全問正解！ 物差しはかせです。" : ok >= 3 ? "よくできました。答えの章で、もう一度たしかめてみよう。" : "意外な答えもありましたね。ほかのモードもためしてみよう。";
      box.innerHTML = `${modeBar()}<div class="quiz-top"><span class="hint">${MODES[mode].t}・けっか</span>${dots()}</div><div class="quiz-q">${N}問中 ${ok}問 正解${rec && ok > 0 ? '<span class="newrec">新記録！</span>' : ""}</div><p>${msg}</p><div class="share-row"><button type="button" class="btn" id="qAgain">もう一回（問題が変わります）</button></div>`;
      bindModes(); $("qAgain").addEventListener("click", () => start(mode)); $("qAgain").focus(); return;
    }
    const q = qs[qi];
    box.innerHTML = `${modeBar()}<div class="quiz-top"><span class="hint">${MODES[mode].t}・第${qi + 1}問 / ${N}問</span>${dots()}</div>
      <div class="quiz-q" id="qText">${esc(q.q)}</div>
      <div class="quiz-opts${q.opts.length === 3 ? " three" : ""}" role="group" aria-labelledby="qText">${q.opts.map((o, k) => `<button type="button" class="qopt" data-k="${k}"><span class="nm">${esc(o.t)}</span>${o.s ? `<span class="ut">${esc(o.s)}</span>` : ""}<span class="rv" hidden></span></button>`).join("")}</div>
      <div id="qAfter" aria-live="polite"></div>`;
    bindModes();
    box.querySelectorAll(".qopt").forEach((el) => el.addEventListener("click", () => answer(+el.dataset.k)));
  }
  function answer(k) {
    const q = qs[qi]; res[qi] = k === q.ans ? "ok" : "ng";
    box.querySelectorAll(".qopt").forEach((el, i) => {
      el.disabled = true; el.classList.add(i === q.ans ? "win" : "lose");
      const o = q.opts[i], rv = el.querySelector(".rv"); if (o.r) { rv.hidden = false; rv.textContent = o.r; }
    });
    box.querySelector(".dots").outerHTML = dots();
    const after = $("qAfter");
    const ln = q.link && $(q.link) ? ` <a class="q-link" href="#${q.link}">→ ${esc(($(q.link).querySelector(".ch-head h2") || {}).textContent || "答えの章")}</a>` : "";
    after.innerHTML = `<div class="q-say">${D.OK.mascot(k === q.ans ? "wow" : "think", 44)}<p><b>${k === q.ans ? "正解！" : "ざんねん！"}</b> ${esc(q.why)}${ln}</p></div>`;
    const nb = document.createElement("button"); nb.type = "button"; nb.className = "btn"; nb.textContent = qi < qs.length - 1 ? "次の問題" : "けっかを見る";
    nb.addEventListener("click", () => { qi++; render(); }); after.appendChild(nb); nb.focus();
  }
  start(MODES[mode] ? mode : "rise");

  // ===== みんなでクイズ（教室の大きな画面用）=====
  // 1問ずつ大きく出して、みんなで考えてから答えを見せる。キーボード：1〜3で選ぶ／Enterで答え／→で次へ／Escでとじる
  const bigEl = document.createElement("div"); bigEl.className = "bigq"; bigEl.hidden = true; bigEl.setAttribute("role", "dialog"); bigEl.setAttribute("aria-modal", "true"); bigEl.setAttribute("aria-label", "みんなでクイズ");
  document.body.appendChild(bigEl);
  let bm = "mix", bq = null, bn = 0, shown = false, picked = -1, bUsed = new Set();
  const L = ["A", "B", "C", "D"];
  function bNext() {
    const keys = Object.keys(MODES), m = bm === "mix" ? keys[rnd(keys.length)] : bm;
    bq = MODES[m].make(bUsed) || (bUsed = new Set(), MODES[m].make(bUsed)); bq.mt = MODES[m].t;
    bn++; shown = false; picked = -1; bRender();
  }
  function bRender() {
    const q = bq;
    bigEl.innerHTML = `<div class="bq-top"><div class="bq-modes">${[["mix", "ぜんぶまぜる"], ...Object.entries(MODES).map(([k, x]) => [k, x.t])].map(([k, t]) => `<button type="button" data-bm="${k}" aria-pressed="${k === bm}">${t}</button>`).join("")}</div>
        <div class="bq-tools"><button type="button" data-a="fs">全画面</button><button type="button" data-a="close" aria-label="とじる">✕ とじる</button></div></div>
      <div class="bq-body"><div class="bq-k">第${bn}問・${esc(q.mt)}</div><div class="bq-q">${esc(q.q)}</div>
        <div class="bq-opts n${q.opts.length}">${q.opts.map((o, i) => `<button type="button" class="bq-o${shown ? (i === q.ans ? " win" : " lose") : ""}${picked === i ? " pk" : ""}" data-i="${i}"><span class="bq-l">${L[i]}</span><span class="bq-t">${esc(o.t)}${o.s ? `<small>${esc(o.s)}</small>` : ""}</span>${shown && o.r ? `<span class="bq-r">${esc(o.r)}</span>` : ""}</button>`).join("")}</div>
        <div class="bq-foot">${shown ? `<div class="bq-why">${D.OK.mascot ? D.OK.mascot("wow", 56) : ""}<p><b>答え：${L[q.ans]}</b>　${esc(q.why)}</p></div><button type="button" class="btn" data-a="next">次の問題 →</button>` : `<span class="bq-hint">みんなで考えてから…</span><button type="button" class="btn" data-a="show">答えを見る</button>`}</div>
        <p class="bq-keys">キーボード：1〜${q.opts.length}で選ぶ ／ Enterで答え ／ →で次へ ／ Escでとじる</p></div>`;
  }
  function bOpen() { bn = 0; bUsed = new Set(); bigEl.hidden = false; document.body.classList.add("bigq-open"); bNext(); }
  function bClose() { bigEl.hidden = true; document.body.classList.remove("bigq-open"); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }
  bigEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.bm) { bm = b.dataset.bm; bn = 0; bNext(); return; }
    if (b.dataset.i != null && !shown) { picked = +b.dataset.i; bRender(); return; }
    const a = b.dataset.a;
    if (a === "show") { shown = true; bRender(); }
    else if (a === "next") bNext();
    else if (a === "close") bClose();
    else if (a === "fs") { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (bigEl.requestFullscreen) bigEl.requestFullscreen().catch(() => {}); }
  });
  addEventListener("keydown", (e) => {
    if (bigEl.hidden) return;
    if (e.key === "Escape" && !document.fullscreenElement) { bClose(); return; }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= bq.opts.length && !shown) { picked = n - 1; bRender(); }
    else if (e.key === "Enter" && !shown) { e.preventDefault(); shown = true; bRender(); }
    else if ((e.key === "ArrowRight" || e.key === " ") && shown) { e.preventDefault(); bNext(); }
  });
  const openBtn = $("bigQuizBtn"); if (openBtn) openBtn.addEventListener("click", bOpen);
})();
