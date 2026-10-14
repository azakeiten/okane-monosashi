// おかねの物差し：2つの県をくらべっこ（最低賃金・物価・おにぎり・お米を、ならべてくらべる）
(() => {
  const D = window, { $, yen, esc, store } = D.OK;
  const box = $("vsBox"); if (!box) return;
  const N = (i) => D.OK.prefName(i);
  const mine = D.OK.pref ? D.OK.pref() : -1;
  let a = store.get("vsA", mine >= 0 ? mine : 12), b = store.get("vsB", mine === 46 ? 12 : 46);
  const opt = (sel) => D.PREFS.map((p, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${N(i)}</option>`).join("");
  // くらべる項目。hi：大きいほうが「うれしい」なら1、小さいほうがうれしいなら-1、どちらでもないなら0
  const ROWS = [
    { t: "最低賃金（2026年度）", f: (i) => D.PREF_WAGE[i], u: "円", hi: 1, fmt: (v) => yen(v) },
    { t: "くらし全体の物価", f: (i) => D.RPI_TOTAL[i], u: "", hi: -1, fmt: (v) => v.toFixed(1), note: "全国平均＝100" },
    { t: "食べ物の物価", f: (i) => D.RPI_FOOD[i], u: "", hi: -1, fmt: (v) => v.toFixed(1) },
    { t: "家賃など住まいの物価", f: (i) => D.RPI_HOUSING[i], u: "", hi: -1, fmt: (v) => v.toFixed(1) },
    { t: "電気・ガス・水道の物価", f: (i) => D.RPI_ENERGY[i], u: "", hi: -1, fmt: (v) => v.toFixed(1) },
    { t: "物価を考えた最低賃金", f: (i) => D.PREF_WAGE[i] / D.RPI_TOTAL[i] * 100, u: "円", hi: 1, fmt: (v) => yen(v), note: "全国と同じ物価だったら、いくら分か" },
    { t: "おにぎり1個（県庁のある市）", f: (i) => D.CITY.onigiri[i], u: "円", hi: -1, fmt: (v) => yen(v) },
    { t: "おにぎりを買うのにはたらく時間", f: (i) => D.CITY.onigiri[i] / D.PREF_WAGE[i] * 60, u: "分", hi: -1, fmt: (v) => v.toFixed(1) },
    { t: "お米5kg（県庁のある市）", f: (i) => D.CITY.rice[i], u: "円", hi: -1, fmt: (v) => yen(v) },
    { t: "お米5kgを買うのにはたらく時間", f: (i) => D.CITY.rice[i] / D.PREF_WAGE[i] * 60, u: "分", hi: -1, fmt: (v) => Math.round(v) },
  ];
  box.innerHTML = `<div class="vs-pick"><label class="vs-a"><span>くらべる県 A</span><select id="vsA">${opt(a)}</select></label>
      <button type="button" class="vs-swap" id="vsSwap" aria-label="AとBを入れかえる">⇄</button>
      <label class="vs-b"><span>くらべる県 B</span><select id="vsB">${opt(b)}</select></label></div>
    <div class="vs-head"><b class="vs-na" id="vsNa"></b><span>VS</span><b class="vs-nb" id="vsNb"></b></div>
    <div class="vs-rows" id="vsRows"></div><p class="vs-sum" id="vsSum"></p>`;

  function render() {
    $("vsNa").textContent = N(a); $("vsNb").textContent = N(b);
    let wa = 0, wb = 0;
    $("vsRows").innerHTML = ROWS.map((r) => {
      const va = r.f(a), vb = r.f(b);
      if (va == null || vb == null || isNaN(va) || isNaN(vb)) return "";
      const mx = Math.max(va, vb), d = va - vb, same = Math.abs(d) / mx < 0.002;
      const good = same || !r.hi ? 0 : (d > 0) === (r.hi > 0) ? 1 : -1; // 1ならAのほうがうれしい
      if (good > 0) wa++; else if (good < 0) wb++;
      const bar = (v, side, win) => `<span class="vs-bar ${side}${win ? " win" : ""}"><i style="width:${(v / mx) * 100}%"></i><em>${win ? "★ " : ""}${r.fmt(v)}${r.u}</em></span>`;
      return `<div class="vs-row"><span class="vs-t">${esc(r.t)}${r.note ? `<small>${esc(r.note)}</small>` : ""}</span>${bar(va, "a", good > 0)}${bar(vb, "b", good < 0)}</div>`;
    }).join("");
    const rw = (i) => D.PREF_WAGE[i] / D.RPI_TOTAL[i] * 100, diff = rw(a) - rw(b);
    $("vsSum").innerHTML = a === b ? "同じ県どうしです。ちがう県をえらんでみよう。"
      : `<b>${N(a)}</b>は${wa}項目、<b>${N(b)}</b>は${wb}項目で、くらす人にとって「うれしいほう」（給料が高い・物価が安い）でした。` +
        `最低賃金の差は${yen(Math.abs(D.PREF_WAGE[a] - D.PREF_WAGE[b]))}円ですが、物価を考えると差は${yen(Math.abs(diff))}円${Math.abs(diff) < Math.abs(D.PREF_WAGE[a] - D.PREF_WAGE[b]) ? "に縮まります" : "になります"}。`;
  }
  const set = () => { a = +$("vsA").value; b = +$("vsB").value; store.set("vsA", a); store.set("vsB", b); render(); };
  $("vsA").addEventListener("change", set); $("vsB").addEventListener("change", set);
  $("vsSwap").addEventListener("click", () => { [a, b] = [b, a]; $("vsA").value = a; $("vsB").value = b; store.set("vsA", a); store.set("vsB", b); render(); });
  render();
})();
