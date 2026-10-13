// おかねの物差し：値段の決まり方（需要と供給）。2本の線が交わる所で値段が決まる、しくみの模型
(() => {
  const D = window, { $, yen } = D.OK;
  const box = $("mkBox"); if (!box) return;
  const it = (id) => D.ITEMS.find((i) => i.id === id);
  const rice = it("rice"), pen = it("pen");
  // ほしい人：P = 200 − Q + 40d ／ 売りたい量：P = Q − 40s（いつも＝値段100・量100）
  const SC = [
    { t: "いつも", d: 0, s: 0, why: "ほしい人の線と、売りたい量の線が交わる所で、値段と売れる量が決まります。下の2つのつまみを動かしてみよう。" },
    { t: "不作でとれない", d: 0, s: -2, why: `天気が悪くて、とれる量がへると、売りたい量の線が左へ動き、値段が上がります。お米5kgは、2015年の${yen(rice.p15)}円から2025年は${yen(rice.p25)}円になりました（東京23区）。理由はいくつも重なっていますが、「売る量がへると値段が上がる」のが基本のしくみです。` },
    { t: "原料が高くなった", d: 0, s: -1, why: "円安などで、外国から買う原料や電気代が高くなると、同じ値段では売れなくなり、売りたい量の線が左へ動きます。値段は上がり、売れる量はへります。", link: "fx" },
    { t: "大人気になった", d: 2, s: 0, why: "テレビやSNSで話題になって、ほしい人がふえると、ほしい人の線が右へ動きます。値段が上がり、売れる量もふえます。" },
    { t: "たくさん作れる", d: 0, s: 2, why: `工場でたくさん作れるようになったり、売る店がふえて競争したりすると、売りたい量の線が右へ動き、値段は下がります。消せるボールペンは、2015年の${yen(pen.p15)}円から2025年は${yen(pen.p25)}円で、10年間ほとんど変わっていません。` },
    { t: "ブームが去った", d: -2, s: 0, why: "ほしい人がへると、ほしい人の線が左へ動きます。お店は売れ残らないように、値段を下げます。" },
  ];
  let d = 0, s = 0, sc = 0;
  const W = 520, H = 300, M = { l: 44, r: 16, t: 30, b: 40 }, QX = 200, PY = 260;
  const x = (q) => M.l + (q / QX) * (W - M.l - M.r), y = (p) => H - M.b - (p / PY) * (H - M.t - M.b);
  const eq = (d, s) => { const q = 100 + 20 * d + 20 * s; return { q, p: 200 - q + 40 * d }; };
  // 線をグラフのわくの中だけで描く
  const seg = (f) => { const pts = []; for (let q = 0; q <= QX; q += 2) { const p = f(q); if (p >= 0 && p <= PY) pts.push(`${x(q).toFixed(1)},${y(p).toFixed(1)}`); } return pts.join(" "); };

  box.innerHTML = `<div class="chips mk-sc" id="mkSc" aria-label="こんなとき、どうなる？">${SC.map((c, i) => `<button type="button" class="chip" data-i="${i}">${c.t}</button>`).join("")}</div>
    <div class="mk-body">
      <div class="mk-chart"><svg viewBox="0 0 ${W} ${H}" id="mkSvg" role="img" aria-label="ほしい人と売りたい量のグラフ"></svg></div>
      <div class="mk-side">
        <div class="mk-out"><span class="mk-k">値段</span><b id="mkP">—</b><span class="mk-k">売れる量</span><b id="mkQ">—</b></div>
        <label class="mk-sl"><span>ほしい人（需要）<em id="mkDl"></em></span><input type="range" id="mkD" min="-2" max="2" step="0.5" value="0"><span class="mk-ends"><i>へる</i><i>ふえる</i></span></label>
        <label class="mk-sl s"><span>売りたい量（供給）<em id="mkSl"></em></span><input type="range" id="mkS" min="-2" max="2" step="0.5" value="0"><span class="mk-ends"><i>へる</i><i>ふえる</i></span></label>
        <p class="mk-why" id="mkWhy" aria-live="polite"></p>
      </div>
    </div>`;

  const lvl = (v) => v === 0 ? "いつも" : v > 0 ? (v >= 1.5 ? "とてもふえる" : "ふえる") : (v <= -1.5 ? "とてもへる" : "へる");
  function render() {
    const e = eq(d, s), b = eq(0, 0);
    let g = "";
    [50, 100, 150, 200, 250].forEach((p) => { g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(p)}" y2="${y(p)}" class="mk-grid"/>`; });
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(100)}" y2="${y(100)}" class="mk-base"/><text x="${W - M.r}" y="${y(100) - 6}" text-anchor="end" class="mk-ax">いつもの値段</text>`;
    g += `<text x="${M.l}" y="22" class="mk-ax">値段 ↑</text><text x="${W - M.r}" y="${H - 10}" text-anchor="end" class="mk-ax">売れる量 →</text>`;
    // いつもの線（うすく）
    if (d !== 0) g += `<polyline points="${seg((q) => 200 - q)}" class="mk-ghost dm"/>`;
    if (s !== 0) g += `<polyline points="${seg((q) => q)}" class="mk-ghost sp"/>`;
    g += `<polyline points="${seg((q) => 200 - q + 40 * d)}" class="mk-line dm"/><polyline points="${seg((q) => q - 40 * s)}" class="mk-line sp"/>`;
    g += `<text x="${x(50)}" y="${y(150 + 40 * d) - 10}" class="mk-lb dm">ほしい人</text>`;
    const lq = Math.min(QX - 4, 230 + 40 * s); g += `<text x="${x(lq)}" y="${y(lq - 40 * s) - 8}" text-anchor="end" class="mk-lb sp">売りたい量</text>`;
    g += `<line x1="${M.l}" x2="${x(e.q)}" y1="${y(e.p)}" y2="${y(e.p)}" class="mk-guide"/><line x1="${x(e.q)}" x2="${x(e.q)}" y1="${y(e.p)}" y2="${H - M.b}" class="mk-guide"/>`;
    if (d || s) g += `<circle cx="${x(b.q)}" cy="${y(b.p)}" r="5" class="mk-dot0"/>`;
    g += `<circle cx="${x(e.q)}" cy="${y(e.p)}" r="9" class="mk-dot"/>`;
    $("mkSvg").innerHTML = g;
    const r = e.p / 100, qr = e.q / 100;
    $("mkP").innerHTML = r === 1 ? "いつも通り" : `いつもの<span class="${r > 1 ? "up" : "dn"}">${r.toFixed(1)}倍</span>`;
    $("mkQ").textContent = qr === 1 ? "いつも通り" : `いつもの${qr.toFixed(1)}倍`;
    $("mkDl").textContent = lvl(d); $("mkSl").textContent = lvl(s);
    const c = SC[sc], match = c && c.d === d && c.s === s;
    const gen = r > 1.001 ? "値段が上がりました。" : r < 0.999 ? "値段が下がりました。" : "値段は、いつもと同じです。";
    $("mkWhy").innerHTML = match ? c.why + (c.link ? ` <a href="#${c.link}">→ 円安の章へ</a>` : "") : `${gen}ほしい人が多いほど、また売りたい量が少ないほど、値段は上がります。`;
    [...$("mkSc").children].forEach((b, i) => b.setAttribute("aria-pressed", String(match && i === sc)));
  }
  $("mkSc").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; sc = +b.dataset.i; d = SC[sc].d; s = SC[sc].s; $("mkD").value = d; $("mkS").value = s; render(); });
  $("mkD").addEventListener("input", (e) => { d = +e.target.value; render(); });
  $("mkS").addEventListener("input", (e) => { s = +e.target.value; render(); });
  render();
})();
