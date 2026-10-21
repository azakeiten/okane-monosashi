// おかねの物差し：わたしが生まれてから、お金はどう変わった？（生まれた年と今をくらべる）
(() => {
  const D = window, { $, yen, cpiAt, store } = D.OK;
  const box = $("sinceBox"), inp = $("mcBirth"); if (!box || !inp) return;
  const NOW = new Date().getFullYear(), LAST = 2025;
  // 消費税の税率（生まれた年の12月の時点）
  const tax = (y) => y < 1989 ? null : y < 1997 ? 3 : y < 2014 ? 5 : y < 2019 ? 8 : 10;
  const C = D.CASHLESS, P = D.POP_TREND;

  function rows(y) {
    const r = [];
    const k = cpiAt("総合", y) / 100;
    r.push({ t: "物価（くらし全体）", a: "1,000円", b: `約${yen(1000 / k)}円`, s: `${y}年に1,000円だった買い物は、今（${LAST}年）だと約${yen(1000 / k)}円です。`, up: 1 / k });
    if (y >= 2002) r.push({ t: "最低賃金（全国平均の時給）", a: `${yen(D.MINWAGE[y])}円`, b: `${yen(D.MINWAGE_2026.avg)}円`, s: `${yen(D.MINWAGE_2026.avg - D.MINWAGE[y])}円上がりました（2026年度）。`, up: D.MINWAGE_2026.avg / D.MINWAGE[y] });
    if (y >= D.FX_FIRST_YEAR) { const f = D.FX[y - D.FX_FIRST_YEAR]; r.push({ t: "1ドルは何円？", a: `${f.toFixed(0)}円`, b: `${D.FX_LATEST.value.toFixed(0)}円`, s: D.FX_LATEST.value > f ? `円安になりました（${D.FX_LATEST.label}）。外国の物は高くなりやすいです。` : `円高になりました（${D.FX_LATEST.label}）。`, up: D.FX_LATEST.value / f }); }
    const t0 = tax(y); r.push({ t: "消費税", a: t0 ? `${t0}%` : "なし", b: "10%", s: t0 === 10 ? (y === 2019 ? "2019年10月に10%になりました（食べ物などは8%）。" : "生まれたときから10%（食べ物などは8%）です。") : t0 ? `${t0}%から10%に上がりました（食べ物などは8%）。` : "消費税は1989年に3%で始まりました。" });
    if (C && y >= C.from) r.push({ t: "キャッシュレスで払う割合", a: `${C.dom[y - C.from].toFixed(1)}%`, b: `${C.dom[C.dom.length - 1].toFixed(1)}%`, s: `カードやスマホで払う人がふえました（${C.from + C.dom.length - 1}年・経済産業省）。`, up: C.dom[C.dom.length - 1] / C.dom[y - C.from] });
    if (P && y >= P.from) { const a = P.v[y - P.from], b = P.v[P.v.length - 1]; const oku = (v) => `${Math.floor(v / 1e8)}億${Math.round((v % 1e8) / 1e4)}万人`; r.push({ t: "日本の人口", a: oku(a), b: oku(b), s: `約${yen((a - b) / 1e4)}万人へりました（各年10月1日）。`, up: b / a }); }
    return r;
  }
  function render() {
    const y = parseInt(inp.value, 10), ok = y >= D.CPI_FIRST_YEAR && y <= LAST;
    if (!ok) { box.innerHTML = `<p class="sn-empty">${D.OK.mascot ? D.OK.mascot("smile", 40) : ""}<span>上の「生まれた年」を入れると、<b>あなたが生まれてから、お金がどう変わったか</b>がここに出ます。</span></p>`; return; }
    box.innerHTML = `<div class="sn-head"><b>${y}年生まれ</b>のあなたが<span class="sn-age">約${NOW - y}歳</span>になるまでに…</div>
      <div class="sn-grid">${rows(y).map((x) => `<div class="sn-c"><span class="sn-t">${x.t}</span>
        <div class="sn-ab"><span><small>${y}年</small><b>${x.a}</b></span><i aria-hidden="true">→</i><span class="now"><small>今</small><b>${x.b}</b></span></div><p>${x.s}</p></div>`).join("")}</div>`;
  }
  inp.addEventListener("input", render);
  render();
})();
