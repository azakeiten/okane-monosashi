// おかねの物差し：家族の1万円（家計調査）・今日の発見・スタンプラリー
(() => {
  const D = window, { $, yen, esc, store, sgn, cpiAt } = D.OK;
  const K = D.KAKEI, KY0 = D.KAKEI_FIRST_YEAR, KY1 = KY0 + K["消費支出"].length - 1;
  const kv = (cat, y) => K[cat][y - KY0] / 12; // 年間 → 1か月
  const GROUPS = [
    { k: "食料", cats: ["食料"], c: "var(--seg3)", d: "食べ物・飲み物・外食" },
    { k: "住まい・光熱", cats: ["住居", "光熱・水道", "家具・家事用品"], c: "var(--seg1)", d: "家賃や修理、電気・ガス・水道、家具や洗剤" },
    { k: "交通・通信", cats: ["交通・通信"], c: "var(--seg6)", d: "電車、車、ガソリン、スマホ・インターネット" },
    { k: "教養娯楽", cats: ["教養娯楽"], c: "var(--seg5)", d: "旅行、ゲーム、本、習いごと、テレビ" },
    { k: "教育・医療", cats: ["教育", "保健医療"], c: "var(--ruler)", d: "授業料や塾、病院や薬" },
    { k: "服とくつ", cats: ["被服及び履物"], c: "var(--seg4)", d: "服、くつ、クリーニング" },
    { k: "その他", cats: ["その他の消費支出"], c: "var(--muted)", d: "こづかい、おつきあい、理容・美容、仕送りなど" },
  ];
  const gv = (g, y) => g.cats.reduce((s, c) => s + kv(c, y), 0);

  // ===== 06 家族の1万円 =====
  const kkYear = $("kkYear"), kkComp = $("kkComp");
  for (let y = KY1; y >= KY0; y--) { [kkYear, kkComp].forEach((s) => { const o = document.createElement("option"); o.value = y; o.textContent = y + "年"; s.appendChild(o); }); }
  kkYear.value = KY1; kkComp.value = 2015;
  let focus = -1;
  [kkYear, kkComp].forEach((s) => s.addEventListener("change", renderKakei));
  function renderKakei() {
    const y = +kkYear.value, c = +kkComp.value, tot = kv("消費支出", y), totC = kv("消費支出", c);
    $("kkTotal").innerHTML = `<div class="big">月 ${yen(tot)}円</div><div class="s">1日あたり約${yen(tot / 30.4)}円・${c}年は月${yen(totC)}円（${sgn((tot / totC - 1) * 100, 1)}）</div>`;
    // 100マスに配分（最大剰余法）
    const shares = GROUPS.map((g) => gv(g, y) / tot * 100);
    const base = shares.map(Math.floor); let rest = 100 - base.reduce((a, b) => a + b);
    shares.map((s, i) => ({ i, r: s - Math.floor(s) })).sort((a, b) => b.r - a.r).slice(0, rest).forEach((o) => base[o.i]++);
    const w = $("waffle"); w.innerHTML = "";
    base.forEach((n, gi) => { for (let k = 0; k < n; k++) {
      const b = document.createElement("button"); b.type = "button"; b.style.background = GROUPS[gi].c;
      b.className = focus >= 0 && focus !== gi ? "dim" : "";
      b.title = `${GROUPS[gi].k}：1万円のうち約${yen(shares[gi] * 100)}円`;
      b.setAttribute("aria-label", b.title);
      b.addEventListener("click", () => { focus = focus === gi ? -1 : gi; renderKakei(); });
      w.appendChild(b);
    } });
    $("kkList").innerHTML = "";
    GROUPS.forEach((g, gi) => {
      const v = gv(g, y), vc = gv(g, c), ch = (v / vc - 1) * 100;
      const r = document.createElement("button"); r.type = "button"; r.className = "kk-row"; r.setAttribute("aria-pressed", String(focus === gi));
      r.innerHTML = `<span class="sw" style="background:${g.c}"></span><span class="nm">${g.k}<small>${g.d}・1万円のうち約${yen(shares[gi] * 100)}円</small></span><span class="amt">${yen(v)}円</span><span class="ch ${ch >= 0 ? "up" : "down"}">${sgn(ch)}</span>`;
      r.addEventListener("click", () => { focus = focus === gi ? -1 : gi; renderKakei(); });
      $("kkList").appendChild(r);
    });
  }
  renderKakei();

  // 家計簿からわかる変化（数字はすべてデータから計算）
  function spark(cat, a, b) {
    const ys = []; for (let y = KY0; y <= KY1; y++) ys.push(y);
    const v = ys.map((y) => kv(cat, y)), lo = Math.min(...v), hi = Math.max(...v);
    const X = (i) => 4 + (i / (ys.length - 1)) * 292, Y = (x) => 40 - ((x - lo) / (hi - lo || 1)) * 34;
    const d = v.map((x, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(x).toFixed(1)}`).join(" ");
    const ia = a - KY0, ib = b - KY0;
    return `<svg viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true"><rect x="${X(ia)}" y="0" width="${Math.max(2, X(ib) - X(ia))}" height="46" fill="var(--ruler)" opacity=".25"/><path d="${d}" fill="none" stroke="var(--cool)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }
  const peakYear = (cat) => { let best = KY0; for (let y = KY0; y <= KY1; y++) if (K[cat][y - KY0] > K[cat][best - KY0]) best = y; return best; };
  const pk = peakYear("通信");
  const STORIES = [
    { cat: "食料", a: 2015, b: KY1, t: "食べ物に使うお金が増えた", d: (x) => `月${yen(kv("食料", 2015))}円 → ${yen(kv("食料", KY1))}円。物の値段が上がり、食べ物は節約しにくいので、食費がふくらんでいます。` },
    { cat: "通信", a: pk, b: KY1, t: "スマホ代は、ピークから下がった", d: () => `いちばん多かったのは${pk}年の月${yen(kv("通信", pk))}円。${KY1}年は月${yen(kv("通信", KY1))}円です。2021年の携帯電話の値下げが大きく関係しています。` },
    { cat: "外食", a: 2019, b: 2020, t: "コロナで外食が急にへった", d: () => `2019年の月${yen(kv("外食", 2019))}円から、2020年は月${yen(kv("外食", 2020))}円へ（${sgn((kv("外食", 2020) / kv("外食", 2019) - 1) * 100)}）。${KY1}年は月${yen(kv("外食", KY1))}円で、${kv("外食", KY1) > kv("外食", 2019) ? "コロナの前より多くなりました" : "コロナの前の近くまでもどりました"}。` },
    { cat: "こづかい(使途不明)", a: KY0, b: KY1, t: "「使い道がわからないこづかい」が約4分の1に", d: () => `${KY0}年の月${yen(kv("こづかい(使途不明)", KY0))}円から、${KY1}年は月${yen(kv("こづかい(使途不明)", KY1))}円。キャッシュレス決済が広がり、何に使ったか記録しやすくなったことも理由と考えられます。` },
    { cat: "被服及び履物", a: KY0, b: KY1, t: "服とくつのお金は、約4割へった", d: () => `${KY0}年の月${yen(kv("被服及び履物", KY0))}円から、${KY1}年は月${yen(kv("被服及び履物", KY1))}円。安い服のお店がふえたことなどが関係しています。` },
    { cat: "菓子類", a: 2015, b: KY1, t: "おかしは過去最高", d: () => `月${yen(kv("菓子類", 2015))}円（2015年）→ ${yen(kv("菓子類", KY1))}円（${KY1}年）。チョコなどの値上がりもあり、${peakYear("菓子類")}年がこの26年でいちばん多くなりました。` },
  ];
  $("kkStories").innerHTML = STORIES.map((s) => {
    const ch = (kv(s.cat, s.b) / kv(s.cat, s.a) - 1) * 100;
    return `<div class="event"><span class="yr">${s.a}→${s.b}年 ${sgn(ch)}</span><b>${s.t}</b>${spark(s.cat, s.a, s.b)}<p>${s.d()}</p></div>`;
  }).join("");

  // ===== 今日の発見 =====
  const CITY = D.CITY, PW = D.PREF_WAGE, item = (id) => D.ITEMS.find((i) => i.id === id);
  const mm = (arr) => { let lo = -1, hi = -1; arr.forEach((v, i) => { if (v == null) return; if (lo < 0 || v < arr[lo]) lo = i; if (hi < 0 || v > arr[hi]) hi = i; }); return [lo, hi]; };
  const [oLo, oHi] = mm(CITY.onigiri);
  const [wLo, wHi] = mm(PW);
  const rice = item("rice");
  const FACTS = [
    `お米5kgは、2020年の<b>${yen(D.TREND.rice[1])}円</b>から2025年は<b>${yen(rice.p25)}円</b>に。5年で2倍以上になりました（東京23区）。`,
    `県庁所在地でおにぎりがいちばん安いのは${esc(D.PREFS[oLo].city)}の<b>${CITY.onigiri[oLo]}円</b>、高いのは${esc(D.PREFS[oHi].city)}の<b>${CITY.onigiri[oHi]}円</b>（2025年平均）。`,
    `2人以上で暮らす家族が使うお金は、平均で月<b>${yen(kv("消費支出", KY1))}円</b>。1日あたり約<b>${yen(kv("消費支出", KY1) / 30.4)}円</b>です。`,
    `2026年度の最低賃金は、${esc(D.OK.prefName(wHi))}の<b>${yen(PW[wHi])}円</b>から${esc(D.OK.prefName(wLo))}の<b>${yen(PW[wLo])}円</b>まで。差は<b>${PW[wHi] - PW[wLo]}円</b>です。`,
    `1990年の物価は今の約<b>${Math.round(cpiAt("総合", 1990))}%</b>。今の1,000円の買い物は、1990年なら約<b>${yen(1000 * cpiAt("総合", 1990) / 100)}円</b>でした。`,
    `ランドセルは2010年の<b>${yen(D.TREND.randoseru[0])}円</b>から2025年は<b>${yen(item("randoseru").p25)}円</b>に（東京23区）。`,
    `2025年のエンゲル係数（食べ物にお金を使う割合）は<b>${D.ENGEL_OFFICIAL.value}%</b>。${D.ENGEL_OFFICIAL.note}です。`,
    `消せるボールペンは2015年<b>${yen(item("pen").p15)}円</b>、2025年<b>${yen(item("pen").p25)}円</b>。10年間、ほとんど値上がりしていません。`,
  ];
  let fi = Math.floor(Math.random() * FACTS.length), auto = !matchMedia("(prefers-reduced-motion: reduce)").matches, timer;
  function showFact() { $("factText").innerHTML = FACTS[fi]; $("factNo").textContent = `${fi + 1}/${FACTS.length}`; }
  function step(d) { fi = (fi + d + FACTS.length) % FACTS.length; showFact(); }
  $("factPrev").addEventListener("click", () => { auto = false; clearInterval(timer); step(-1); });
  $("factNext").addEventListener("click", () => { auto = false; clearInterval(timer); step(1); });
  showFact();
  if (auto) timer = setInterval(() => { if (!document.hidden) step(1); }, 8000);

  // ===== スタンプラリー =====
  const CH = [["money", "お金ってなに？"], ["hours", "はたらく時間"], ["map", "日本地図"], ["rank", "ランキング"], ["time", "タイムマシン"], ["race", "給料と物価"], ["save", "貯金"], ["fx", "円安・円高"], ["kakei", "家族の1万円"], ["school", "学校のお金"], ["pay", "手取り"], ["agewage", "年れいと給料"], ["big", "1人あたり"], ["tax", "消費税"], ["diary", "おこづかい帳"], ["quiz", "クイズ"], ["words", "ことば"]];
  let got = new Set(store.get("stamps", []));
  const rot = (i) => [-8, 6, -4, 9, -11, 5, -6, 10, -3, 7, -9, 4, -7, 8, -5, 6, -10][i];
  function renderStamps(popId) {
    $("stampGrid").innerHTML = CH.map(([id, t], i) => `<a class="stamp${got.has(id) ? " got" : ""}${popId === id ? " pop" : ""}" href="#${id}" style="--rot:${rot(i)}deg"><span><span class="n">${String(i + 1).padStart(2, "0")}</span>${got.has(id) ? t : "まだ"}</span></a>`).join("");
    $("stampCount").textContent = `${got.size} / ${CH.length}`;
    $("stampPillN").textContent = `${got.size}/${CH.length}`;
    if (got.size === CH.length) {
      const day = store.get("certDay", null) || (() => { const d = new Date(); const s = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; store.set("certDay", s); return s; })();
      $("cert").innerHTML = `<div class="cert"><span class="hint">にんていしょう</span><span class="t">物差しはかせ</span>
        <input id="certName" type="text" maxlength="20" placeholder="なまえを書こう" aria-label="なまえ" value="${esc(store.get("certName", ""))}">
        <p>あなたは「おかねの物差し」の${CH.length}の章をすべて読み、<br>お金を自分の生活の単位ではかる力を身につけました。</p>
        <span class="seal">物差し<br>認定</span><span class="hint">${day}・スクリーンショットで残しておこう</span></div>`;
      $("certName").addEventListener("input", (e) => store.set("certName", e.target.value));
    } else {
      $("cert").innerHTML = `<p class="hint">あと${CH.length - got.size}こ。スタンプを押すと、その章にとべます。</p>`;
    }
  }
  renderStamps();
  if ("IntersectionObserver" in window) {
    const timers = {};
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      const id = e.target.id;
      if (got.has(id)) return;
      if (e.isIntersecting) timers[id] = setTimeout(() => { got.add(id); store.set("stamps", [...got]); renderStamps(id); document.dispatchEvent(new CustomEvent("okane:stamp")); }, 1500);
      else clearTimeout(timers[id]);
    }), { threshold: 0.25 });
    CH.forEach(([id]) => { const el = $(id); if (el) io.observe(el); });
  }
})();
