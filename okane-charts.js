// おかねの物差し：物価タイムマシン・55年グラフ・できごと・給料と物価・貯金とインフレ・手取り
(() => {
  const D = window, { $, yen, pos, esc, sgn, cpiAt, AVG10 } = D.OK;
  const Y0 = D.CPI_FIRST_YEAR, Y1 = 2025;
  const YEARS = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
  const CATS = ["総合", "食料", "菓子類", "外食", "電気代", "通信", "教育", "教養娯楽", "被服及び履物"];
  const CAT_NAME = { "総合": "総合（くらし全体）", "食料": "食料", "菓子類": "菓子類（おやつ）", "外食": "外食", "電気代": "電気代", "通信": "通信（電話・スマホ）", "教育": "教育（授業料など）", "教養娯楽": "教養娯楽（あそび・習いごと）", "被服及び履物": "服とくつ" };
  const EVENTS = [
    { y: 1974, t: "オイルショック", d: "石油の値段が急に上がり、1年で物価が約23%も上がりました。トイレットペーパーの買いだめさわぎも起きました。" },
    { y: 1989, t: "消費税3%スタート", d: "物を買うときに税金がかかるようになりました。その後、1997年に5%、2014年に8%、2019年に10%になりました。" },
    { y: 1999, t: "物価が上がらない時代", d: "1990年代の終わりから約20年、物価はほとんど上がりませんでした。給料もあまり上がりませんでした。" },
    { y: 2014, t: "消費税8%", d: "税率が上がった年は、物価のグラフが一段上がります。" },
    { y: 2022, t: "世界的な物価高と円安", d: "エネルギーや食べ物の値段が世界中で上がり、円安で輸入品も高くなりました。日本でも物価が急に上がり始めました。" },
  ];
  const STORIES = [
    { cat: "通信", from: 2020, to: 2022, t: "スマホ代が大きく下がった", d: "2021年に、携帯電話会社が安い料金プランを次々に出しました。通信の指数は2年で3割ほど下がりました。" },
    { cat: "教育", from: 2009, to: 2011, t: "教育費が下がった年", d: "2010年に公立高校の授業料が無料になりました。2019〜2020年にも、幼児教育や高校・大学の支援が広がり、ふたたび下がっています。" },
    { cat: "電気代", from: 2021, to: 2024, t: "電気代のジェットコースター", d: "2022年に燃料の値段が上がって電気代が急に上がり、2023年は国の補助で下がりました。補助が終わると、また上がります。" },
  ];

  // 汎用：折れ線グラフ
  function lineChart(svg, opt) {
    const { W, H, M, xs, series, yMin, yMax, yTicks, xTicks, fmtX, onHover, marks = [] } = opt;
    const X = (i) => M.l + (i / (xs.length - 1)) * (W - M.l - M.r);
    const Y = (v) => M.t + (1 - (v - yMin) / (yMax - yMin)) * (H - M.t - M.b);
    let s = "";
    yTicks.forEach((g) => { s += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)" stroke-dasharray="${g === 100 ? "" : "2 4"}"/><text x="${M.l - 8}" y="${Y(g) + 4}" text-anchor="end">${g}</text>`; });
    xs.forEach((x, i) => { if (xTicks(x, i)) s += `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${fmtX(x)}</text>`; });
    marks.forEach((m) => { s += m(X, Y); });
    series.forEach((se) => {
      const d = se.v.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
      s += `<path d="${d}" fill="none" stroke="${se.c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      const li = se.v.length - 1;
      s += `<circle cx="${X(li)}" cy="${Y(se.v[li])}" r="4.5" fill="${se.c}" stroke="var(--card)" stroke-width="2"/>`;
      if (se.label) s += `<text class="lbl" x="${X(li) + 10}" y="${Y(se.v[li]) + (se.dy || 0) - 2}">${se.label}</text><text x="${X(li) + 10}" y="${Y(se.v[li]) + (se.dy || 0) + 13}">${se.end}</text>`;
    });
    s += `<g class="hov" style="display:none"><line class="hl" y1="${M.t}" y2="${H - M.b}" stroke="var(--ink-2)"/>${series.map((se, k) => `<circle class="hc${k}" r="5" fill="${se.c}" stroke="var(--card)" stroke-width="2"/>`).join("")}</g>`;
    s += `<rect class="hit" x="${M.l - 10}" y="0" width="${W - M.l - M.r + 20}" height="${H}" fill="transparent"/>`;
    svg.innerHTML = s;
    const hov = svg.querySelector(".hov"), tip = opt.tip;
    function move(ev) {
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const i = Math.max(0, Math.min(xs.length - 1, Math.round(((p.x - M.l) / (W - M.l - M.r)) * (xs.length - 1))));
      hov.style.display = ""; hov.querySelector(".hl").setAttribute("x1", X(i)); hov.querySelector(".hl").setAttribute("x2", X(i));
      let top = Infinity;
      series.forEach((se, k) => { const c = hov.querySelector(".hc" + k); c.setAttribute("cx", X(i)); c.setAttribute("cy", Y(se.v[i])); top = Math.min(top, Y(se.v[i])); });
      const box = svg.getBoundingClientRect(), card = tip.parentElement.getBoundingClientRect(), sc = box.width / W;
      const z = parseFloat(getComputedStyle(tip.parentElement).zoom) * (parseFloat(getComputedStyle(document.querySelector("main")).zoom) || 1) || 1; // 文字を大きくしたとき（zoom）のずれを直す
      tip.hidden = false;
      tip.style.left = Math.max(80, Math.min(card.width - 80, box.left - card.left + X(i) * sc)) / z + "px";
      tip.style.top = (box.top - card.top + top * sc - 8) / z + "px";
      tip.innerHTML = onHover(i);
    }
    const hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", move); hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", () => { hov.style.display = "none"; tip.hidden = true; });
    return { X, Y };
  }
  D.OK.lineChart = lineChart;

  // ===== 03 物価タイムマシン =====
  const tmCat = $("tmCat"), tmYear = $("tmYear"), tmPrice = $("tmPrice");
  CATS.forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = CAT_NAME[c]; tmCat.appendChild(o); });
  function renderTM() {
    const cat = tmCat.value, y = +tmYear.value, p = pos(tmPrice, 1);
    const then = p * cpiAt(cat, y) / cpiAt(cat, 2025);
    $("tmYearLabel").textContent = y;
    [...$("tmPresets").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.y === y)));
    $("tmLabel").textContent = `${y}年なら、だいたい`;
    $("tmValue").innerHTML = `${yen(then)}<span class="u">円</span>`;
    const ch = (cpiAt(cat, 2025) / cpiAt(cat, y) - 1) * 100;
    $("tmSub").innerHTML = `「${esc(CAT_NAME[cat])}」の値段は、${y}年から2025年までに <b>${sgn(ch, 1)}</b> 変わりました（指数 ${cpiAt(cat, y).toFixed(1)} → 100）。` + (ch < 0 ? " 昔のほうが高かったことになります。" : "");
    const ev = EVENTS.find((e) => Math.abs(e.y - y) <= 1);
    $("tmWage").innerHTML = (D.MINWAGE[y] ? `そのころの最低賃金（全国平均）は <b>${yen(D.MINWAGE[y])}円</b>。今の値段${yen(p)}円の品物は、当時の値段で約${(then / D.MINWAGE[y] * 60).toFixed(0)}分はたらけば買えました。` : `最低賃金の全国平均は2002年度からのデータを使っています。`) + (ev ? `<br>このころのできごと：<b>${ev.t}</b>` : "");
    drawLong();
  }
  [tmCat, tmYear, tmPrice].forEach((el) => el.addEventListener("input", renderTM));
  // よく使う年（2026年に何歳かで考える）
  [[2010, "今の高校1年生が生まれた年"], [1995, "今31歳の人が生まれた年"], [1985, "今41歳の人が生まれた年"], [1974, "オイルショックの年"]].forEach(([y, t]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.y = y; b.innerHTML = `${y}年<span class="num">${t}</span>`;
    b.addEventListener("click", () => { tmYear.value = y; renderTM(); });
    $("tmPresets").appendChild(b);
  });

  function drawLong() {
    const cat = tmCat.value, y = +tmYear.value;
    const vals = YEARS.map((yy) => cpiAt(cat, yy));
    const showBase = cat !== "総合";
    const hi = Math.max(...vals, 100), lo = Math.min(...vals, 20);
    const yMax = Math.ceil(hi / 20) * 20, yMin = Math.max(0, Math.floor(lo / 20) * 20);
    const ticks = []; for (let g = yMin; g <= yMax; g += 20) ticks.push(g);
    $("longTitle").textContent = `${CAT_NAME[cat]}の物価の55年（2025年＝100）`;
    $("longLegend").innerHTML = `<span style="--c:var(--cool)">${esc(CAT_NAME[cat])}</span>` + (showBase ? `<span style="--c:var(--muted)">総合（くらし全体）</span>` : "");
    const series = [{ v: vals, c: "var(--cool)", label: cat === "総合" ? "総合" : cat.replace("及び履物", ""), end: "100" }];
    if (showBase) series.unshift({ v: YEARS.map((yy) => cpiAt("総合", yy)), c: "var(--muted)" });
    const yi = y - Y0;
    lineChart($("longChart"), {
      W: 760, H: 330, M: { l: 40, r: 84, t: 30, b: 28 }, xs: YEARS, series, yMin, yMax, yTicks: ticks,
      xTicks: (x) => x % 10 === 0 || x === 2025, fmtX: (x) => x, tip: $("longTip"),
      marks: [
        (X, Y) => `<rect x="${X(yi)}" y="30" width="${X(YEARS.length - 1) - X(yi)}" height="272" fill="var(--ruler)" opacity=".18" rx="4"/><line x1="${X(yi)}" x2="${X(yi)}" y1="30" y2="302" stroke="var(--ruler)" stroke-width="2"/><text class="ev" x="${X(yi) + 4}" y="42">${y}年→今</text>`,
        (X, Y) => cat === "総合" ? EVENTS.map((e, k) => { const i = e.y - Y0; return `<circle cx="${X(i)}" cy="${Y(vals[i])}" r="4" fill="var(--ruler)" stroke="var(--ink)" stroke-width="1.5"/><text class="ev" x="${X(i)}" y="${Y(vals[i]) - (k % 2 ? 26 : 12)}" text-anchor="middle">${e.t}</text>`; }).join("") : "",
      ],
      onHover: (i) => `<b>${YEARS[i]}年</b><br>${esc(CAT_NAME[cat])} <b>${vals[i].toFixed(1)}</b>` + (showBase ? `<br>総合 <b>${cpiAt("総合", YEARS[i]).toFixed(1)}</b>` : "") + `<br>今の1,000円は <b>${yen(1000 * vals[i] / 100)}円</b>`,
    });
  }
  $("longTableBtn").addEventListener("click", () => {
    const w = $("longTable"), open = w.hidden;
    w.hidden = !open; $("longTableBtn").setAttribute("aria-expanded", String(open)); $("longTableBtn").textContent = open ? "表を閉じる" : "数字の表で見る";
    if (open && !w.innerHTML) {
      w.innerHTML = `<table class="data"><thead><tr><th>年</th>${CATS.map((c) => `<th>${c.replace("及び履物", "")}</th>`).join("")}<th>最低賃金</th></tr></thead><tbody>` +
        YEARS.slice().reverse().map((y) => `<tr><td>${y}</td>${CATS.map((c) => `<td>${cpiAt(c, y).toFixed(1)}</td>`).join("")}<td>${D.MINWAGE[y] ? yen(D.MINWAGE[y]) : "—"}</td></tr>`).join("") + "</tbody></table>";
    }
  });

  // できごとカード（小さなグラフつき）
  $("events").innerHTML = STORIES.map((s, k) => {
    const ys = YEARS.filter((y) => y >= s.from - 4 && y <= Math.min(2025, s.to + 2));
    const v = ys.map((y) => cpiAt(s.cat, y));
    const lo = Math.min(...v), hi = Math.max(...v);
    const X = (i) => 4 + (i / (ys.length - 1)) * 292, Y = (x) => 40 - ((x - lo) / (hi - lo || 1)) * 34;
    const d = v.map((x, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(x).toFixed(1)}`).join(" ");
    const a = ys.indexOf(s.from), b = ys.indexOf(s.to);
    const ch = (cpiAt(s.cat, s.to) / cpiAt(s.cat, s.from) - 1) * 100;
    return `<div class="event"><span class="yr">${s.from}→${s.to}年・${esc(CAT_NAME[s.cat])} ${sgn(ch)}</span><b>${s.t}</b>
      <svg viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true"><rect x="${X(a)}" y="0" width="${X(b) - X(a)}" height="46" fill="var(--ruler)" opacity=".25"/><path d="${d}" fill="none" stroke="var(--cool)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
      <p>${s.d}</p></div>`;
  }).join("");

  // ===== 04 給料と物価 =====
  const RY = Object.keys(D.MINWAGE).map(Number).filter((y) => y <= 2025);
  const w0 = D.MINWAGE[2002], c0 = cpiAt("総合", 2002);
  const wI = RY.map((y) => D.MINWAGE[y] / w0 * 100), cI = RY.map((y) => cpiAt("総合", y) / c0 * 100);
  lineChart($("raceChart"), {
    W: 760, H: 300, M: { l: 40, r: 110, t: 16, b: 28 }, xs: RY, yMin: 90, yMax: 180, yTicks: [100, 120, 140, 160, 180],
    series: [
      { v: wI, c: "var(--hot)", label: "最低賃金", end: wI[wI.length - 1].toFixed(0) + "（" + (wI[wI.length - 1] / 100).toFixed(2) + "倍）" },
      { v: cI, c: "var(--cool)", label: "物価", end: cI[cI.length - 1].toFixed(0) + "（" + (cI[cI.length - 1] / 100).toFixed(2) + "倍）" },
    ],
    xTicks: (x) => x % 4 === 2 || x === 2025, fmtX: (x) => x, tip: $("raceTip"),
    onHover: (i) => `<b>${RY[i]}年</b><br>最低賃金 <b>${yen(D.MINWAGE[RY[i]])}円</b>（${wI[i].toFixed(0)}）<br>物価指数 <b>${cpiAt("総合", RY[i]).toFixed(1)}</b>（${cI[i].toFixed(0)}）`,
  });
  const real = wI[wI.length - 1] / cI[cI.length - 1];
  $("raceText").innerHTML = `2002年から2025年までに、最低賃金は <b>${(wI[wI.length - 1] / 100).toFixed(2)}倍</b>、物価は <b>${(cI[cI.length - 1] / 100).toFixed(2)}倍</b> になりました。物価の上がり方を差し引くと、最低賃金ではたらいて買えるものは約 <b>${Math.round((real - 1) * 100)}%</b> 増えたことになります。2026年度にはさらに1,177円に上がります。`;

  // ===== 05 貯金とインフレ =====
  let inf = 2;
  $("infSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; inf = +b.dataset.v; renderSave(); });
  ["svAmt", "svYears", "svRate"].forEach((id) => $(id).addEventListener("input", renderSave));
  function renderSave() {
    [...$("infSeg").children].forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === inf)));
    const A = pos($("svAmt"), 10000), n = +$("svYears").value, r = Math.max(0, parseFloat($("svRate").value) || 0) / 100, f = inf / 100;
    $("svYearsLabel").textContent = n; $("svLabel").textContent = `${n}年後、通帳には ${yen(A * Math.pow(1 + r, n))}円`;
    const realV = A * Math.pow(1 + r, n) / Math.pow(1 + f, n);
    $("svValue").innerHTML = `${yen(realV)}<span class="u">円ぶんの価値</span>`;
    const diff = realV / A - 1;
    $("svSub").innerHTML = Math.abs(diff) < 0.005 ? "利息と物価の上がり方がほぼ同じなので、買う力はほとんど変わりません。"
      : diff < 0 ? `利息より物価の上がり方が大きいので、今の${yen(A)}円で買えるものの <b>${Math.round(realV / A * 100)}%</b> しか買えなくなります。`
      : `物価より利息のほうが大きいので、買う力は <b>${Math.round(diff * 100)}%</b> 増えます。`;
    const W = 560, H = 220, M = { l: 52, r: 12, t: 12, b: 26 };
    const pts = Array.from({ length: n + 1 }, (_, i) => ({ nom: A * Math.pow(1 + r, i), real: A * Math.pow(1 + r, i) / Math.pow(1 + f, i) }));
    const mx = Math.max(...pts.map((p) => p.nom)) * 1.05, mn = Math.min(...pts.map((p) => p.real)) * 0.9;
    const yMin = Math.floor(mn / (A / 10)) * (A / 10), yMax = mx;
    const X = (i) => M.l + (i / n) * (W - M.l - M.r), Y = (v) => M.t + (1 - (v - yMin) / (yMax - yMin)) * (H - M.t - M.b);
    let s = "";
    for (let k = 0; k <= 4; k++) { const v = yMin + (yMax - yMin) * k / 4; s += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${M.l - 6}" y="${Y(v) + 4}" text-anchor="end">${yen(v)}</text>`; }
    [0, Math.round(n / 2), n].forEach((i) => { s += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${i}年後</text>`; });
    const path = (k) => pts.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join(" ");
    s += `<path d="${path("nom")} L${X(n)} ${Y(pts[n].real)} ${pts.slice().reverse().map((p, j) => `L${X(n - j).toFixed(1)} ${Y(p.real).toFixed(1)}`).join(" ")} Z" fill="var(--hot)" opacity=".10"/>`;
    s += `<path d="${path("nom")}" fill="none" stroke="var(--accent)" stroke-width="2.5"/><path d="${path("real")}" fill="none" stroke="var(--hot)" stroke-width="2.5"/>`;
    s += `<circle cx="${X(n)}" cy="${Y(pts[n].real)}" r="4.5" fill="var(--hot)" stroke="var(--card)" stroke-width="2"/>`;
    $("svChart").innerHTML = s;
  }
  const c15 = cpiAt("総合", 2015);
  $("svReal").innerHTML = `物価指数は2015年が${c15.toFixed(1)}、2025年が100です。2015年に貯金箱に入れた1万円は、2025年には <b>約${yen(10000 * c15 / 100)}円ぶん</b> の物しか買えなくなっています（金額は1万円のまま）。反対に、2015年の1万円と同じだけ買うには、今は <b>約${yen(10000 * 100 / c15)}円</b> 必要です。1年あたりにならすと、物価は約${((Math.pow(100 / c15, 1 / 10) - 1) * 100).toFixed(1)}%ずつ上がりました。`;

  // ===== 06 手取り =====
  const payIn = $("payIn"); let yearN = 1;
  $("paySeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; payIn.value = b.dataset.pay; renderPay(); });
  $("yearSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; yearN = +b.dataset.y; renderPay(); });
  payIn.addEventListener("input", renderPay);
  const kyuyo = (a) => a <= 1900000 ? Math.min(a, 650000) : a <= 3600000 ? a * .3 + 80000 : a <= 6600000 ? a * .2 + 440000 : a <= 8500000 ? a * .1 + 1100000 : 1950000;
  const kiso = (i) => i <= 1320000 ? 950000 : i <= 3360000 ? 880000 : i <= 4890000 ? 680000 : i <= 6550000 ? 630000 : i <= 23500000 ? 580000 : 0;
  function itax(t) {
    if (t <= 0) return 0;
    const br = [[1950000, .05, 0], [3300000, .10, 97500], [6950000, .20, 427500], [9000000, .23, 636000], [18000000, .33, 1536000], [40000000, .40, 2796000], [Infinity, .45, 4796000]];
    const [, r, d] = br.find((b) => t <= b[0]); return (t * r - d) * 1.021;
  }
  D.OK.calcPay = (m, yr) => {
    const ken = m * .0495, kodomo = m * .00115, nen = Math.min(m, 650000) * .0915, koyo = m * .005;
    const sha = ken + kodomo + nen + koyo, annual = m * 12, shaY = sha * 12;
    const shotoku = Math.max(0, annual - kyuyo(annual));
    const taxable = Math.max(0, Math.floor((shotoku - shaY - kiso(shotoku)) / 1000) * 1000);
    const tax = itax(taxable) / 12;
    let jumin = 0;
    if (yr === 2 && shotoku > 450000) jumin = (Math.max(0, (shotoku - shaY - 430000) * .1 - 2500) + 5000) / 12;
    return { ken, kodomo, nen, koyo, tax, jumin, net: m - sha - tax - jumin };
  };
  function renderPay() {
    const m = Math.max(0, parseFloat(payIn.value) || 0);
    [...$("paySeg").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.pay === m)));
    [...$("yearSeg").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.y === yearN)));
    const r = D.OK.calcPay(m, yearN);
    const parts = [
      { k: "厚生年金", v: r.nen, c: "var(--seg1)", w: "老後などにもらう年金のための保険料" },
      { k: "健康保険", v: r.ken, c: "var(--seg2)", w: "病院代が3割ですむための保険料" },
      { k: "子ども・子育て支援金", v: r.kodomo, c: "var(--seg6)", w: "2026年度から。子育て支援に使われる" },
      { k: "雇用保険", v: r.koyo, c: "var(--seg5)", w: "仕事をなくしたときなどのための保険料" },
      { k: "所得税", v: r.tax, c: "var(--seg3)", w: "国に払う税金。収入が多いほど割合が上がる" },
      { k: "住民税", v: r.jumin, c: "var(--seg4)", w: yearN === 1 ? "1年目は、ふつうはまだ引かれない" : "住んでいる市区町村・都道府県に払う税金" },
    ];
    const ded = m - r.net;
    $("netValue").innerHTML = `${yen(r.net)}<span class="u">円</span>`;
    $("netSub").innerHTML = m ? `額面 ${yen(m)}円のうち <b>${yen(ded)}円</b>（約${Math.round(ded / m * 100)}%）が引かれます。1年では約${yen(ded * 12)}円です。` : "給料を入れてください。";
    $("stack").innerHTML = m ? `<div class="take" style="flex:0 0 ${(r.net / m) * 100}%" title="手取り"></div>` + parts.filter((p) => p.v > 0).map((p) => `<div style="flex:1 1 ${(p.v / m) * 100}%;background:${p.c}" title="${p.k} ${yen(p.v)}円"></div>`).join("") : "";
    // 給与明細書のかたちで見せる
    const sha = r.ken + r.kodomo + r.nen + r.koyo, zei = r.tax + r.jumin;
    const row = (p) => `<div class="slip-row"><span class="sw" style="background:${p.c}"></span><span class="nm">${p.k}<small>${p.w}</small></span><span class="amt">${yen(p.v)}</span></div>`;
    $("deds").innerHTML = `<div class="slip">
      <div class="slip-head"><b>給与明細書</b><span>${yearN === 1 ? "はたらきはじめて1年目" : "2年目から"}・2026年度の料率・単位：円</span></div>
      <div class="slip-sec"><span class="tag">支給</span><div class="slip-rows"><div class="slip-row"><span></span><span class="nm">基本給（額面）<small>会社が決めた1か月の給料</small></span><span class="amt">${yen(m)}</span></div></div></div>
      <div class="slip-sec"><span class="tag">控除</span><div class="slip-rows">${parts.slice(0, 4).map(row).join("")}<div class="slip-row sum"><span></span><span class="nm">社会保険料の合計</span><span class="amt">${yen(sha)}</span></div>${parts.slice(4).map(row).join("")}<div class="slip-row sum"><span></span><span class="nm">税金の合計</span><span class="amt">${yen(zei)}</span></div></div></div>
      <div class="slip-total"><b>差引支給額（手取り）</b><span class="slip-stamp">${yearN === 1 ? "住民税<br>まだ<br>なし" : "住民税<br>スタート"}</span><span class="num">${yen(r.net)}円</span></div>
    </div>
    <p class="hint">手取りは、あなたの時給（${yen(D.OK.wage())}円）でいうと約${Math.round(r.net / D.OK.wage())}時間ぶんです。</p>`;
    const emp = r.ken + r.kodomo + r.nen + m * .0085;
    $("employerText").innerHTML = `この給料なら、会社は健康保険・厚生年金・子ども・子育て支援金・雇用保険で、毎月およそ <b class="num">${yen(emp)}円</b> を給料とは別に払っています。会社から見ると、あなたをやとうのに月 <b class="num">${yen(m + emp)}円</b> 以上かかっている計算です（雇用保険の会社負担0.85%。労災保険などはふくみません）。`;
  }
  D.OK.onUnit(renderPay);

  renderTM(); renderSave(); renderPay();
})();
