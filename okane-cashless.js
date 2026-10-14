// おかねの物差し：キャッシュレスは、どれくらい広がった？（2010〜2025年の決済比率・10回の買い物・内わけ）
(() => {
  const D = window, { $ } = D.OK;
  const box = $("clBox"); const C = D.CASHLESS; if (!box || !C) return;
  const N = C.dom.length, Y1 = C.from + N - 1;
  let y = Y1;
  const W = 520, H = 230, L = 34, R = 20, T = 14, B = 28;
  const x = (i) => L + (i / (N - 1)) * (W - L - R), yy = (v) => T + (1 - v / 70) * (H - T - B);
  const line = (a) => a.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${yy(v).toFixed(1)}`).join("");
  const card = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5" fill="var(--cool)"/><rect x="2" y="8" width="20" height="2.5" fill="var(--ink)" opacity=".5"/><rect x="5" y="14" width="6" height="2" rx="1" fill="#fff"/></svg>`;
  const cash = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#d9b44a" stroke="#a8862c" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="900" fill="#5a4410">円</text></svg>`;

  box.innerHTML = `<div class="cl-grid">
    <div class="cl-card"><svg viewBox="0 0 ${W} ${H}" id="clSvg" role="img" aria-label="キャッシュレス決済比率の推移"></svg>
      <div class="legend"><span style="--c:var(--cool)">国内指標（新しい物差し）</span><span style="--c:var(--muted)">国際比較指標（これまでの物差し）</span></div>
      <label class="cl-sl"><span>年：<b id="clY"></b></span><input type="range" id="clIn" min="${C.from}" max="${Y1}" value="${Y1}"></label></div>
    <div class="cl-side"><div class="cl-ten"><span class="cl-k">1万円の買い物のうち（1こ＝1,000円）</span><div class="cl-icons" id="clIcons"></div><p id="clTxt"></p></div>
      <div class="cl-mix"><span class="cl-k">${Y1}年のキャッシュレス ${C.amount[N - 1]}兆円の内わけ</span><div class="cl-bar">${C.mix2025.map((m, i) => `<i style="width:${m.p}%;--c:var(--seg${[1, 3, 6, 5][i]})" title="${m.t} ${m.p}%"></i>`).join("")}</div>
        <ul>${C.mix2025.map((m, i) => `<li style="--c:var(--seg${[1, 3, 6, 5][i]})"><span class="sw"></span>${m.t}<b>${m.p}%</b></li>`).join("")}</ul></div></div></div>`;

  function render() {
    const i = y - C.from, d = C.dom[i], k = d / 10;
    let s = [0, 20, 40, 60].map((v) => `<line x1="${L}" x2="${W - R}" y1="${yy(v)}" y2="${yy(v)}" class="cl-gl"/><text x="${L - 6}" y="${yy(v) + 4}" text-anchor="end" class="cl-ax">${v}%</text>`).join("");
    s += `<line x1="${L}" x2="${W - R}" y1="${yy(C.goal.dom)}" y2="${yy(C.goal.dom)}" class="cl-goal"/><text x="${L + 6}" y="${yy(C.goal.dom) - 5}" class="cl-ax goal">${C.goal.year}年の目標 ${C.goal.dom}%</text>`;
    [C.from, 2015, 2020, Y1].forEach((yr) => { s += `<text x="${x(yr - C.from)}" y="${H - 8}" text-anchor="${yr === Y1 ? "end" : yr === C.from ? "start" : "middle"}" class="cl-ax">${yr}</text>`; });
    s += `<path d="${line(C.intl)}" class="cl-l intl"/><path d="${line(C.dom)}" class="cl-l dom"/>`;
    s += `<line x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${H - B}" class="cl-cur"/><circle cx="${x(i)}" cy="${yy(d)}" r="6" class="cl-dot"/><text x="${x(i) > W - 80 ? x(i) - 10 : x(i) + 10}" y="${yy(d) - 10}" text-anchor="${x(i) > W - 80 ? "end" : "start"}" class="cl-val">${d.toFixed(1)}%</text>`;
    $("clSvg").innerHTML = s; $("clY").textContent = y + "年";
    const full = Math.floor(k), part = k - full;
    $("clIcons").innerHTML = Array.from({ length: 10 }, (_, j) => `<span class="cl-i${j < full ? " on" : j === full && part >= 0.5 ? " on half" : ""}">${j < full || (j === full && part >= 0.5) ? card : cash}</span>`).join("");
    $("clTxt").innerHTML = `${y}年は、払ったお金（金額）の<b>${d.toFixed(1)}%</b>がキャッシュレスでした。1万円の買い物なら、約${Math.round(d * 100).toLocaleString()}円ぶんです。${y === Y1 ? `${C.from}年（${C.dom[0].toFixed(1)}%）の<b>約${(d / C.dom[0]).toFixed(1)}倍</b>です。` : ""}`;
  }
  $("clIn").addEventListener("input", (e) => { y = +e.target.value; render(); });
  render();
})();
