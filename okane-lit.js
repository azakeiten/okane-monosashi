// おかねの物差し：数字にだまされない！統計の読み方（グラフの目もり・平均のわな）
(() => {
  const D = window, { $, yen, cpiAt } = D.OK;
  const box = $("litBox"); if (!box) return;

  // ===== 1. グラフの目もりのひみつ =====
  const YS = []; for (let y = 2016; y <= 2025; y++) YS.push(y);
  const V = YS.map((y) => cpiAt("総合", y));
  let zoom = true;
  const W = 520, H = 240, L = 44, R = 10, T = 14, Bm = 30;
  function chart() {
    const lo = zoom ? Math.floor(Math.min(...V) - 1) : 0, hi = zoom ? Math.ceil(Math.max(...V) + 0.5) : 110;
    const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - Bm), bw = (W - L - R) / V.length;
    const ticks = zoom ? [lo, Math.round((lo + hi) / 2), hi] : [0, 50, 100];
    let s = ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="lt-grid"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" class="lt-ax">${t}</text>`).join("");
    s += V.map((v, i) => `<rect x="${L + i * bw + 3}" y="${y(v)}" width="${bw - 6}" height="${y(lo) - y(v)}" rx="3" class="lt-bar${i === V.length - 1 ? " last" : ""}"/>` + (i % 3 === 0 || i === V.length - 1 ? `<text x="${L + i * bw + bw / 2}" y="${H - 10}" text-anchor="middle" class="lt-ax">${YS[i]}</text>` : "")).join("");
    if (zoom) s += `<path d="M${L - 14} ${H - Bm - 8}l8 -5l-8 -5l8 -5" class="lt-cut"/>`;
    $("ltSvg").innerHTML = s;
    const up = ((V[V.length - 1] / V[0] - 1) * 100).toFixed(1), look = (y(lo) - y(V[V.length - 1])) / (y(lo) - y(V[0]));
    $("ltMsg").innerHTML = zoom
      ? `目もりが<b>${lo}から</b>始まっています。最後の棒は最初の棒の<b>約${look.toFixed(1)}倍</b>の高さに見えますが、本当は<b>${up}%</b>しか上がっていません。`
      : `目もりを<b>0から</b>にすると、10年間の上がり方（<b>${up}%</b>）が、そのままの大きさで見えます。`;
    [...$("ltSeg").children].forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.z === "1") === zoom)));
  }

  // ===== 2. 平均のわな =====
  const BASE = [600, 800, 1000, 1200];
  let x = 1500;
  function avg() {
    const all = [...BASE, x].sort((a, b) => a - b), mean = all.reduce((a, b) => a + b, 0) / all.length, med = all[2];
    const mx = Math.max(12000, x * 1.05), px = (v) => 4 + (v / mx) * 92;
    $("avLine").innerHTML = `<div class="av-axis"></div>` + [...BASE.map((v) => [v, ""]), [x, "e"]].map(([v, c]) => `<span class="av-kid ${c}" style="left:${px(v)}%">${D.OK.mascot ? D.OK.mascot(c ? "wow" : "smile", 26) : "●"}</span>`).join("") +
      `<span class="av-mk mean" style="left:${px(mean)}%"><b>平均</b>${yen(mean)}円</span><span class="av-mk med" style="left:${px(med)}%"><b>真ん中</b>${yen(med)}円</span>`;
    $("avX").textContent = yen(x) + "円";
    const gap = mean - med;
    $("avMsg").innerHTML = gap < 150
      ? `平均（${yen(mean)}円）と真ん中の人（${yen(med)}円）は、ほとんど同じです。`
      : `1人だけがたくさんもらうと、<b>平均は${yen(mean)}円</b>まで上がります。でも5人のうち4人は${yen(Math.max(...BASE))}円以下で、<b>真ん中の人は${yen(med)}円</b>のまま。「平均」は、ふつうの人の金額とはかぎりません。`;
  }

  box.innerHTML = `<div class="lt-grid2">
    <div class="lt-card"><h4>1. グラフの目もりのひみつ</h4><p class="lt-lead">同じ物価のグラフ（全国・総合、2025年＝100）です。目もりの始まりを変えてみよう。</p>
      <div class="seg" id="ltSeg"><button type="button" data-z="1">とちゅうから</button><button type="button" data-z="0">0から</button></div>
      <svg viewBox="0 0 ${W} ${H}" id="ltSvg" role="img" aria-label="2016年から2025年の物価の棒グラフ"></svg><p class="lt-msg" id="ltMsg"></p>
      <p class="lt-tip">ニュースやチラシのグラフを見たら、まず<b>目もりがいくつから始まっているか</b>をたしかめよう。</p></div>
    <div class="lt-card"><h4>2. 平均のわな</h4><p class="lt-lead">5人の1か月のおこづかい。1人だけの金額を変えると、平均と「真ん中の人」はどうなる？</p>
      <label class="lt-sl"><span>5人目のおこづかい <b id="avX"></b></span><input type="range" id="avIn" min="500" max="50000" step="500" value="${x}"></label>
      <div class="av-line" id="avLine"></div><p class="lt-msg" id="avMsg"></p>
      <p class="lt-tip">給料の「平均」も、たくさんもらう人に引っぱられて高めに出ます。だから国の統計では、真ん中の人の金額（<b>中央値</b>）もよく使われます。</p></div>
  </div>`;
  $("ltSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; zoom = b.dataset.z === "1"; chart(); });
  $("avIn").addEventListener("input", (e) => { x = +e.target.value; avg(); });
  chart(); avg();
})();
