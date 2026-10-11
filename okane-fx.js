// おかねの物差し：円安・円高（ドル円）・サイト内をさがす
(() => {
  const D = window, { $, yen, esc, store, sgn } = D.OK;
  const Y0 = D.FX_FIRST_YEAR, FX = D.FX, Y1 = Y0 + FX.length - 1;
  const rate = (y) => y === "now" ? D.FX_LATEST.value : FX[y - Y0];
  const yName = (y) => y === "now" ? `今（${D.FX_LATEST.label}）` : `${y}年`;
  const minI = FX.indexOf(Math.min(...FX)), maxI = FX.indexOf(Math.max(...FX.slice(10))); // 2000年以降で最も円安

  // ===== 07 1ドルは何円？ =====
  let sel = store.get("fxYear", Y1);
  const yIn = $("fxYear"), usdIn = $("fxUsd");
  usdIn.value = store.get("fxUsd", 100);
  const YCH = [[1990, "1990年"], [Y0 + minI, `${Y0 + minI}年（円高）`], [2015, "2015年"], [Y1, `${Y1}年`], ["now", `今（${D.FX_LATEST.label}）`]];
  YCH.forEach(([y, t]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.y = y; b.textContent = t;
    b.addEventListener("click", () => { sel = y === "now" ? "now" : +y; store.set("fxYear", sel); if (sel !== "now") yIn.value = sel; render(); });
    $("fxYears").appendChild(b);
  });
  [[100, "100ドル"], [499, "499ドル（ゲーム機の例）"], [1000, "1,000ドル（海外旅行の例）"]].forEach(([v, t]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.v = v; b.textContent = t;
    b.addEventListener("click", () => { usdIn.value = v; store.set("fxUsd", v); render(); });
    $("fxChips").appendChild(b);
  });
  yIn.addEventListener("input", () => { sel = +yIn.value; store.set("fxYear", sel); render(); });
  usdIn.addEventListener("input", () => { store.set("fxUsd", usdIn.value); render(); });

  function render() {
    if (sel !== "now") yIn.value = sel;
    $("fxYearL").textContent = sel === "now" ? D.FX_LATEST.label : sel;
    [...$("fxYears").children].forEach((c) => c.setAttribute("aria-pressed", String(String(sel) === c.dataset.y)));
    const usd = Math.max(0, parseFloat(usdIn.value) || 0);
    [...$("fxChips").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.v === usd)));
    const r = rate(sel), jp = usd * r;
    $("fxLabel").textContent = `${yName(sel)}（1ドル＝${r.toFixed(1)}円）なら、${usd.toLocaleString()}ドルは`;
    $("fxValue").innerHTML = `${yen(jp)}<span class="u">円</span>`;
    const r25 = rate(Y1), d = usd * (r - r25);
    $("fxSub").innerHTML = `1万円は約<b>${(10000 / r).toFixed(1)}ドル</b>。` + (sel === Y1 ? "" : `${Y1}年とくらべると${Math.abs(d) < 1 ? "ほぼ同じ" : `<b>${yen(Math.abs(d))}円${d > 0 ? "高い" : "安い"}</b>`}です。`);
    const rows = [Y0 + minI, 2015, 2020, Y1, "now"];
    const mx = Math.max(...rows.map(rate));
    $("fxCompare").innerHTML = `<div class="label">同じ${usd.toLocaleString()}ドルの物が、日本の円だと</div>` + rows.map((y) => `<div class="fx-row${String(y) === String(sel) ? " on" : ""}"><span class="y">${yName(y)}</span><span class="bar"><i style="width:${rate(y) / mx * 100}%"></i></span><span class="v">${yen(usd * rate(y))}円</span></div>`).join("");
    drawChart();
  }
  function drawChart() {
    const xs = FX.map((_, i) => Y0 + i), si = sel === "now" ? xs.length - 1 : sel - Y0;
    D.OK.lineChart($("fxChart"), {
      W: 760, H: 300, M: { l: 40, r: 96, t: 22, b: 28 }, xs, yMin: 60, yMax: 160, yTicks: [60, 80, 100, 120, 140, 160],
      series: [{ v: FX, c: "var(--cool)", label: `${Y1}年`, end: `${FX[FX.length - 1].toFixed(1)}円` }],
      xTicks: (x) => x % 5 === 0 || x === Y1, fmtX: (x) => x, tip: $("fxTip"),
      marks: [
        (X, Y) => `<line x1="${X(si)}" x2="${X(si)}" y1="22" y2="272" stroke="var(--ruler)" stroke-width="3" opacity=".8"/>`,
        (X, Y) => `<circle cx="${X(minI)}" cy="${Y(FX[minI])}" r="4" fill="var(--ruler)" stroke="var(--ink)" stroke-width="1.5"/><text class="ev" x="${X(minI)}" y="${Y(FX[minI]) + 20}" text-anchor="middle">いちばん円高 ${FX[minI].toFixed(1)}円</text>` +
          `<circle cx="${X(maxI)}" cy="${Y(FX[maxI])}" r="4" fill="var(--ruler)" stroke="var(--ink)" stroke-width="1.5"/><text class="ev" x="${X(maxI) - 6}" y="${Y(FX[maxI]) - 10}" text-anchor="end">円安 ${FX[maxI].toFixed(1)}円</text>`,
      ],
      onHover: (i) => `<b>${xs[i]}年</b><br>1ドル＝<b>${FX[i].toFixed(1)}円</b><br>100ドルは <b>${yen(100 * FX[i])}円</b>`,
    });
  }
  // できごとカード（すべてデータから）
  const r21 = rate(2021), r24 = rate(2024);
  $("fxCards").innerHTML = [
    { yr: `${Y0 + minI}年`, t: "円高の時代", d: `1ドル＝約${FX[minI].toFixed(0)}円。100ドルの物が約${yen(100 * FX[minI])}円で買えました。海外旅行はお得でしたが、日本の物を外国に売る会社は苦しみました。` },
    { yr: `2021→2024年 ${sgn((r24 / r21 - 1) * 100)}`, t: "急な円安", d: `1ドル＝${r21.toFixed(1)}円から${r24.toFixed(1)}円へ。外国から買うガソリンや小麦が高くなり、日本の物価が上がった理由のひとつになりました。` },
    { yr: D.FX_LATEST.label, t: "今の1ドル", d: `月平均で1ドル＝${D.FX_LATEST.value.toFixed(1)}円。1万円は約${(10000 / D.FX_LATEST.value).toFixed(1)}ドル、100ドルの物は約${yen(100 * D.FX_LATEST.value)}円です。` },
  ].map((c) => `<div class="event"><span class="yr">${c.yr}</span><b>${c.t}</b><p>${c.d}</p></div>`).join("");

  // ===== サイトの中をさがす =====
  const dlg = $("findDlg"), inp = $("findIn"), res = $("findRes");
  // カタカナをひらがなに、全角英数を半角に（「オニギリ」でも「おにぎり」でも見つかるように）
  const norm = (s) => String(s).toLowerCase().replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\s+/g, "");
  const plain = (el) => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent.trim(); };
  let index = null;
  function build() {
    const out = [];
    document.querySelectorAll("section.ch").forEach((s) => {
      const h = s.querySelector(".ch-head h2") || s.querySelector("h2"); if (!h) return;
      const n = s.querySelector(".rule-band span"), tk = s.querySelector(".takeaway p");
      out.push({ type: "章", label: `${n ? n.textContent + " " : ""}${plain(h)}`, sub: tk ? tk.textContent : "", href: "#" + s.id, key: norm(plain(h) + " " + plain(s.querySelector(".ch-head p")) + " " + (tk ? tk.textContent : "")) });
    });
    D.ITEMS.forEach((it) => out.push({ type: "品物", label: it.name, sub: `${it.unit}・${yen(it.p25)}円（東京23区・2025年）→ はたらく時間で見る`, href: "#hours", act: () => D.OK.selectItem(it.id), key: norm(it.name + it.unit) }));
    D.PREFS.forEach((p, i) => out.push({ type: "都道府県", label: D.OK.prefName(i), sub: `最低賃金 ${yen(D.PREF_WAGE[i])}円・${p.city} → 日本地図で見る`, href: "#map", act: () => D.OK.selectPrefOnMap && D.OK.selectPrefOnMap(i), key: norm(D.OK.prefName(i) + p.city) }));
    document.querySelectorAll(".word").forEach((w) => { const t = w.querySelector(".w").textContent, r = w.querySelector(".r"); out.push({ type: "ことば", label: t, sub: w.querySelector("p").textContent.slice(0, 48) + "…", href: "#words", act: () => { w.classList.add("flash"); setTimeout(() => w.classList.remove("flash"), 2400); setTimeout(() => w.scrollIntoView({ block: "center", behavior: "instant" }), 50); }, key: norm(t + (r ? r.textContent : "")) }); });
    return out;
  }
  function search() {
    if (!index) index = build();
    const q = norm(inp.value);
    if (!q) { res.innerHTML = `<li class="find-hint">言葉を入れると、章・品物・都道府県・ことばから見つけます。</li>`; return; }
    const hit = index.filter((x) => x.key.includes(q)).sort((a, b) => (norm(a.label).startsWith(q) ? 0 : 1) - (norm(b.label).startsWith(q) ? 0 : 1)).slice(0, 14);
    res.innerHTML = hit.length ? hit.map((x, k) => `<li><a href="${x.href}" data-k="${index.indexOf(x)}"><span class="ft">${x.type}</span><span class="fl">${esc(x.label)}</span><span class="fs">${esc(x.sub)}</span></a></li>`).join("") : `<li class="find-hint">「${esc(inp.value)}」は見つかりませんでした。ちがう言葉でためしてみよう。</li>`;
    res.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { const x = index[+a.dataset.k]; if (x.act) x.act(); dlg.close(); }));
  }
  $("findBtn").addEventListener("click", () => { index = null; inp.value = ""; search(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); setTimeout(() => inp.focus(), 30); });
  $("findClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  inp.addEventListener("input", search);
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = res.querySelector("a"); if (a) { e.preventDefault(); a.click(); } } });

  render();
})();
