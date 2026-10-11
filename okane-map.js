// おかねの物差し：日本地図（47都道府県のタイル地図）
(() => {
  const D = window, { $, yen, esc, store } = D.OK;
  const N = D.PREFS.length;
  let metric = store.get("mapMetric", "minutes"), item = store.get("mapItem", "onigiri"), sel = D.OK.pref() >= 0 ? D.OK.pref() : 12;
  if (!D.CITY[item]) item = "onigiri";
  const itemSel = $("mapItem");
  D.ITEMS.forEach((it) => { if (!D.CITY[it.id]) return; const o = document.createElement("option"); o.value = it.id; o.textContent = `${it.name}（${it.unit}）`; itemSel.appendChild(o); });
  itemSel.value = item;
  itemSel.addEventListener("change", () => { item = itemSel.value; store.set("mapItem", item); render(); });
  $("mapMetric").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; metric = b.dataset.m; store.set("mapMetric", metric); render(); });
  const short = (p) => p;
  const it = () => D.ITEMS.find((x) => x.id === item);

  function values() {
    const price = D.CITY[item];
    if (metric === "wage") return D.PREF_WAGE.slice();
    if (metric === "price") return price.slice();
    return price.map((p, i) => p == null ? null : p / D.PREF_WAGE[i] * 60);
  }
  const fmt = (v) => v == null ? "—" : metric === "minutes" ? (v < 60 ? v.toFixed(1) : (v / 60).toFixed(1) + "h") : metric === "wage" ? yen(v) : v >= 10000 ? (v / 10000).toFixed(1) + "万" : yen(v);
  const fmtLong = (v) => v == null ? "調査なし" : metric === "minutes" ? D.OK.hmText(v / 60) : yen(v) + "円";
  function rankOf(vals, i) {
    // 大きい順の順位（値段・最低賃金は高い順、分は長い順）
    const v = vals[i]; if (v == null) return null;
    return vals.filter((x) => x != null && x > v).length + 1;
  }

  function render() {
    [...$("mapMetric").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === metric)));
    itemSel.disabled = metric === "wage";
    const vals = values(), known = vals.filter((v) => v != null);
    const lo = Math.min(...known), hi = Math.max(...known);
    const bin = (v) => v == null ? 0 : Math.min(5, 1 + Math.floor(((v - lo) / (hi - lo || 1)) * 5));
    const C = 42, my = D.OK.pref();
    let s = "";
    D.PREFS.forEach((p, i) => {
      const [cx, cy] = D.PREF_TILE[i], x = cx * C + 6, y = cy * C + 4, b = bin(vals[i]);
      const fill = b ? `var(--q${b})` : "var(--soft)", ink = b >= 4 ? "var(--q-ink-hi)" : "var(--q-ink-lo)";
      s += `<g class="tile${i === sel ? " sel" : ""}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(D.OK.prefName(i))} ${esc(fmtLong(vals[i]))}">
        <rect x="${x}" y="${y}" width="${C - 2}" height="${C - 2}" rx="6" fill="${fill}"/>
        <text x="${x + (C - 2) / 2}" y="${y + 17}" text-anchor="middle" fill="${ink}">${short(p.p)}</text>
        <text class="v" x="${x + (C - 2) / 2}" y="${y + 32}" text-anchor="middle" fill="${ink}">${fmt(vals[i])}</text>
        ${i === my ? `<circle cx="${x + C - 8}" cy="${y + 6}" r="5" fill="var(--ruler)" stroke="var(--card)" stroke-width="1.5"/>` : ""}
      </g>`;
    });
    // 見出しと補助
    const unitLabel = metric === "minutes" ? `${it().name}を買うのに何分はたらく？` : metric === "wage" ? "2026年度の最低賃金（円／時）" : `${it().name}（${it().unit}）の値段（円）`;
    s += `<text x="8" y="24" font-family="Zen Kaku Gothic New, sans-serif" font-size="15" font-weight="700" fill="var(--ink)">${esc(unitLabel)}</text><text x="8" y="44" font-family="Zen Kaku Gothic New, sans-serif" font-size="12" fill="var(--muted)">マスを押すと、くわしい数字が出ます</text>`;
    $("mapSvg").innerHTML = s;
    $("mapSvg").querySelectorAll(".tile").forEach((g) => {
      const go = () => { sel = +g.dataset.i; render(); };
      g.addEventListener("click", go);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    $("mapLegend").innerHTML = `<span>${metric === "minutes" ? "短い" : "低い"}</span><span class="ramp">${[1, 2, 3, 4, 5].map((k) => `<i style="background:var(--q${k})"></i>`).join("")}</span><span>${metric === "minutes" ? "長い" : "高い"}</span><span class="num">（${fmtLong(lo)} 〜 ${fmtLong(hi)}）</span>` + (my >= 0 ? `<span><span class="sw" style="background:var(--ruler);border-radius:50%"></span>あなたの県</span>` : "");
    renderCard(vals);
    renderRank(vals);
    renderInsight();
  }

  function renderCard(vals) {
    const i = sel, p = D.PREFS[i], x = it(), price = D.CITY[item][i];
    const w = D.PREF_WAGE[i], old = D.PREF_WAGE_OLD[i];
    const mins = price == null ? null : price / w * 60;
    const rk = rankOf(vals, i);
    const rkText = rk == null ? "" : metric === "minutes" ? `47都道府県で、長いほうから${rk}番目` : metric === "wage" ? `47都道府県で、高いほうから${rk}番目` : `47都道府県で、高いほうから${rk}番目`;
    $("prefCard").innerHTML = `<div class="label">えらんだ県</div>
      <div><div class="pname">${esc(D.OK.prefName(i))}</div><div class="pcity">値段は${esc(p.city)}の2025年平均</div></div>
      <div class="pref-stats">
        <div><span class="k">最低賃金（2026年度）</span><span class="v">${yen(w)}円</span><span class="s">前の年度 ${yen(old)}円から +${w - old}円・${D.PREF_WAGE_DATE[i]}から</span></div>
        <div><span class="k">${esc(x.name)}（${esc(x.unit)}）</span><span class="v">${price == null ? "—" : yen(price) + "円"}</span><span class="s">東京23区は ${yen(D.CITY[item][12])}円</span></div>
        <div><span class="k">買うのにはたらく時間</span><span class="v">${mins == null ? "—" : D.OK.hmText(mins / 60)}</span><span class="s">値段 ÷ この県の最低賃金</span></div>
        <div><span class="k">地図の順位</span><span class="v">${rk == null ? "—" : rk + "位"}</span><span class="s">${rkText}</span></div>
      </div>`;
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn ghost";
    b.textContent = D.OK.pref() === i ? "あなたの物差しに設定ずみ" : "この県の時給を、あなたの物差しにする";
    b.disabled = D.OK.pref() === i;
    b.addEventListener("click", () => { D.OK.setPref(i); render(); });
    $("prefCard").appendChild(b);
  }

  function renderRank(vals) {
    const rows = vals.map((v, i) => ({ v, i })).filter((r) => r.v != null).sort((a, b) => b.v - a.v);
    const top = rows.slice(0, 5), bot = rows.slice(-5).reverse();
    const hiT = metric === "minutes" ? "長くはたらく" : "高い", loT = metric === "minutes" ? "短くてすむ" : metric === "wage" ? "低い" : "安い";
    $("mapRankTitle").textContent = metric === "minutes" ? `${it().name}を買うのにかかる時間` : metric === "wage" ? "最低賃金" : `${it().name}の値段`;
    const li = (r) => `<li><button type="button" data-i="${r.i}">${esc(D.OK.prefName(r.i))}</button><span class="num">${metric === "minutes" ? r.v.toFixed(1) + "分" : yen(r.v) + "円"}</span></li>`;
    $("mapRank").innerHTML = `<div><h4>${hiT} 5県</h4><ol>${top.map(li).join("")}</ol></div><div><h4>${loT} 5県</h4><ol>${bot.map(li).join("")}</ol></div>`;
    $("mapRank").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { sel = +b.dataset.i; render(); }));
  }

  function renderInsight() {
    const xs = [], ys = [];
    D.CITY[item].forEach((p, i) => { if (p != null) { xs.push(D.PREF_WAGE[i]); ys.push(p); } });
    const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, myv = ys.reduce((a, b) => a + b) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let k = 0; k < n; k++) { sxy += (xs[k] - mx) * (ys[k] - myv); sxx += (xs[k] - mx) ** 2; syy += (ys[k] - myv) ** 2; }
    const r = sxy / Math.sqrt(sxx * syy);
    const word = r >= 0.6 ? "強い関係があります" : r >= 0.3 ? "少し関係があります" : r > -0.3 ? "ほとんど関係がありません" : "反対の関係があります";
    const x = it(), mins = D.CITY[item].map((p, i) => p == null ? null : p / D.PREF_WAGE[i] * 60);
    const valid = mins.map((m, i) => ({ m, i })).filter((o) => o.m != null).sort((a, b) => a.m - b.m);
    const best = valid[0], worst = valid[valid.length - 1];
    $("mapInsight").innerHTML = `「${esc(x.name)}」の値段と、その県の最低賃金をくらべると、<b>${word}</b>（相関係数 r＝${r.toFixed(2)}）。相関係数は、2つの数字が一緒に増えたり減ったりするかを −1〜1 で表したもので、1に近いほど「片方が高いともう片方も高い」ことを表します。<br>同じ${esc(x.name)}を買うのにはたらく時間がいちばん短いのは${esc(D.OK.prefName(best.i))}（${D.OK.hmText(best.m / 60)}）、いちばん長いのは${esc(D.OK.prefName(worst.i))}（${D.OK.hmText(worst.m / 60)}）。最低賃金が高い県でも、値段も高ければ、買いやすいとはかぎりません。`;
  }

  // さがす機能から、県をえらんで開けるように
  D.OK.selectPrefOnMap = (i) => { sel = i; render(); };
  D.OK.onUnit(render);
  render();
})();
