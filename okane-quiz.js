// おかねの物差し：クイズ（4つのモード・いちばんよかった点数を記録）
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
  };

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
    after.innerHTML = `<p style="margin-bottom:10px"><b>${k === q.ans ? "正解！" : "ざんねん！"}</b> ${esc(q.why)}</p>`;
    const nb = document.createElement("button"); nb.type = "button"; nb.className = "btn"; nb.textContent = qi < qs.length - 1 ? "次の問題" : "けっかを見る";
    nb.addEventListener("click", () => { qi++; render(); }); after.appendChild(nb); nb.focus();
  }
  start(MODES[mode] ? mode : "rise");
})();
