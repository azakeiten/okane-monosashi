// おかねの物差し：共通の道具・ヒーロー・はたらく時間・ランキング・クイズ・ことば辞典
(() => {
  const D = window;
  const $ = (id) => document.getElementById(id);
  const yen = (n) => Math.round(n).toLocaleString("ja-JP");
  const pos = (el, d) => { const v = parseFloat(el.value); return isFinite(v) && v > 0 ? v : d; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("okane:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("okane:" + k, JSON.stringify(v)); } catch (e) {} },
  };
  function hm(hours) { const t = Math.round(hours * 60); return { h: Math.floor(t / 60), m: t % 60 }; }
  function hmText(hours) {
    if (hours < 1 / 60) return "1分未満";
    const { h, m } = hm(hours);
    if (h === 0) return `約${m}分`;
    return m ? `約${h}時間${m}分` : `約${h}時間`;
  }
  function hmHTML(hours) {
    if (hours < 1 / 60) return `1<span class="u">分未満</span>`;
    const { h, m } = hm(hours);
    return (h ? `${h.toLocaleString()}<span class="u">時間</span>` : "") + (m || !h ? `${m}<span class="u">分</span>` : "");
  }
  const pct = (a, b) => (b / a - 1) * 100;
  const sgn = (v, d = 0) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d) + "%";
  const cpiAt = (cat, y) => D.CPI[cat][y - D.CPI_FIRST_YEAR];
  const AVG10 = pct(cpiAt("総合", 2015), cpiAt("総合", 2025));
  const ONIGIRI = D.ITEMS.find((i) => i.id === "onigiri").p25;
  // 共有する道具
  D.OK = { $, yen, pos, esc, store, hmText, hmHTML, pct, sgn, cpiAt, AVG10 };

  // ===== ふりがな =====
  const furi = $("furiToggle");
  if (store.get("furigana", false)) { document.body.classList.add("furigana"); furi.setAttribute("aria-pressed", "true"); }
  furi.addEventListener("click", () => {
    const on = !document.body.classList.contains("furigana");
    document.body.classList.toggle("furigana", on); furi.setAttribute("aria-pressed", String(on)); store.set("furigana", on);
  });

  // ===== あなたの物差し（時給・おこづかい） =====
  const wageIn = $("wageIn"), allowIn = $("allowIn"), prefSel = $("prefSel");
  D.PREFS.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${p.p}${p.p === "北海道" ? "" : p.p === "東京" ? "都" : p.p === "大阪" || p.p === "京都" ? "府" : "県"}（${yen(D.PREF_WAGE[i])}円）`; prefSel.appendChild(o); });
  D.OK.prefName = (i) => { const p = D.PREFS[i].p; return p === "北海道" ? p : p + (p === "東京" ? "都" : p === "大阪" || p === "京都" ? "府" : "県"); };
  wageIn.value = store.get("wage", 1177); allowIn.value = store.get("allow", 3000); prefSel.value = store.get("pref", "");
  const listeners = [];
  D.OK.onUnit = (fn) => listeners.push(fn);
  D.OK.wage = () => pos(wageIn, 1177);
  D.OK.allow = () => pos(allowIn, 3000);
  D.OK.pref = () => prefSel.value === "" ? -1 : +prefSel.value;
  D.OK.setPref = (i) => { prefSel.value = String(i); wageIn.value = D.PREF_WAGE[i]; unitChanged(); };
  function unitChanged() {
    const w = D.OK.wage(), pi = D.OK.pref();
    if (pi >= 0 && D.PREF_WAGE[pi] !== w) prefSel.value = "";
    [...$("wageSeg").children].forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.wage === w)));
    $("pillWage").textContent = (D.OK.pref() >= 0 ? D.OK.prefName(D.OK.pref()) + " " : "") + yen(w) + "円";
    store.set("wage", w); store.set("allow", D.OK.allow()); store.set("pref", prefSel.value);
    listeners.forEach((fn) => fn());
  }
  $("wageSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; wageIn.value = b.dataset.wage; prefSel.value = ""; unitChanged(); });
  prefSel.addEventListener("change", () => { if (prefSel.value !== "") wageIn.value = D.PREF_WAGE[+prefSel.value]; else wageIn.value = 1177; unitChanged(); });
  wageIn.addEventListener("input", unitChanged);
  allowIn.addEventListener("input", unitChanged);
  setTimeout(() => { $("pillWage").textContent = (D.OK.pref() >= 0 ? D.OK.prefName(D.OK.pref()) + " " : "") + yen(D.OK.wage()) + "円"; }, 0);

  // ===== ヒーロー：3つの物差し =====
  const heroPrice = $("heroPrice");
  const HERO = ["rice", "onigiri", "karaoke", "randoseru"].map((id) => D.ITEMS.find((i) => i.id === id));
  HERO.push({ name: "ゲーム機（例）", p25: 49980 });
  HERO.forEach((it) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.price = it.p25;
    b.innerHTML = `${esc(it.name)}<span class="num">${yen(it.p25)}円</span>`;
    b.addEventListener("click", () => { heroPrice.value = it.p25; renderHero(); });
    $("heroChips").appendChild(b);
  });
  heroPrice.addEventListener("input", renderHero);
  function renderHero() {
    const p = pos(heroPrice, 1), w = D.OK.wage(), a = D.OK.allow();
    [...$("heroChips").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.price === p)));
    const h = p / w;
    $("cvHours").innerHTML = hmHTML(h).replace(/class="u"/g, "");
    $("cvHoursS").textContent = h >= 8 ? `1日8時間で ${(h / 8).toFixed(1)}日ぶん（時給${yen(w)}円）` : `時給${yen(w)}円ではたらくと`;
    const months = p / a;
    $("cvAllow").innerHTML = months < 1 ? `${Math.round(months * 100)}<small>%</small>` : `${months < 10 ? months.toFixed(1) : Math.round(months).toLocaleString()}<small>か月ぶん</small>`;
    $("cvAllowS").textContent = months < 1 ? `月${yen(a)}円のおこづかいのうち` : `月${yen(a)}円をぜんぶためると`;
    const oni = p / ONIGIRI;
    $("cvOni").innerHTML = oni < 1 ? `${(oni).toFixed(1)}<small>個ぶん</small>` : `${Math.round(oni).toLocaleString()}<small>個</small>`;
    drawHeroRuler(h);
  }
  function drawHeroRuler(h) {
    // 1日（8時間）を1本の物差しに。こえたら何日目かを数える
    const L = 16, R = 944, W = R - L, Y = 16, H = 30;
    const days = Math.floor(h / 8), rest = h - days * 8;
    const x = (hr) => L + (hr / 8) * W;
    let s = `<rect x="${L}" y="${Y}" width="${W}" height="${H}" rx="6" fill="var(--soft)"/>`;
    const fill = days >= 1 ? W : Math.max(3, x(rest) - L);
    s += `<rect x="${L}" y="${Y}" width="${fill}" height="${H}" rx="6" fill="var(--ruler)"/>`;
    for (let m = 0; m <= 8 * 4; m++) {
      const hr = m / 4, big = m % 4 === 0;
      s += `<line x1="${x(hr)}" x2="${x(hr)}" y1="${Y}" y2="${Y + (big ? 14 : 7)}" stroke="var(--ink)" stroke-width="${big ? 1.5 : 1}" opacity="${big ? .9 : .45}"/>`;
      if (big) s += `<text x="${x(hr)}" y="${Y + H + 20}" text-anchor="middle" font-family="DM Mono, monospace" font-size="13" fill="var(--muted)">${hr === 0 ? "0" : hr + "時間"}</text>`;
    }
    if (days >= 1) {
      s += `<text x="${R - 10}" y="${Y + 21}" text-anchor="end" font-size="15" font-weight="700" fill="var(--ruler-ink)" font-family="Zen Kaku Gothic New, sans-serif">1日8時間 × ${days.toLocaleString()}日${rest > 0.05 ? " ＋ " + hmText(rest).replace("約", "") : ""}</text>`;
    } else {
      const xm = x(rest);
      s += `<line x1="${xm}" x2="${xm}" y1="${Y - 6}" y2="${Y + H + 4}" stroke="var(--ink)" stroke-width="2.5"/><path d="M${xm - 6} ${Y - 12} h12 l-6 8 z" fill="var(--ink)"/>`;
    }
    $("heroRuler").innerHTML = s;
  }
  D.OK.onUnit(renderHero);
  renderHero();

  // ===== 01 はたらく時間 =====
  let group = store.get("group", "food"), cur = store.get("item", "onigiri");
  if (!D.ITEMS.some((i) => i.id === cur)) cur = "onigiri";
  const groupChips = $("groupChips");
  Object.entries(D.GROUPS).forEach(([k, v]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.g = k; b.textContent = v;
    b.addEventListener("click", () => { group = k; store.set("group", k); renderGrid(); });
    groupChips.appendChild(b);
  });
  function renderGrid() {
    [...groupChips.children].forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.g === group)));
    const grid = $("itemGrid"); grid.innerHTML = "";
    D.ITEMS.filter((i) => i.g === group).forEach((it) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "item"; b.setAttribute("aria-pressed", String(it.id === cur));
      b.innerHTML = `<span class="nm">${esc(it.name)}</span><span class="ut">${esc(it.unit)}</span><span class="pr">${yen(it.p25)}<small>円</small></span>`;
      b.addEventListener("click", () => { cur = it.id; store.set("item", cur); renderGrid(); renderHours(); });
      grid.appendChild(b);
    });
  }
  function renderHours() {
    const it = D.ITEMS.find((i) => i.id === cur), w = D.OK.wage();
    const h = it.p25 / w;
    $("hLabel").textContent = `${it.name}（${it.unit}・${yen(it.p25)}円）を買うには`;
    $("hValue").innerHTML = hmHTML(h);
    $("hSub").innerHTML = `${yen(it.p25)}円 ÷ 時給${yen(w)}円。` + (h >= 8 ? `1日8時間はたらくと <b>${(h / 8).toFixed(1)}日</b> ぶんです。` : `1日8時間のうち <b>${Math.max(1, Math.round(h / 8 * 100))}%</b> です。`);
    const viz = $("hViz"), leg = $("hLegend");
    if (h > 320) {
      const months = h / 160; let s = '<div class="months">';
      for (let i = 0; i < Math.min(Math.ceil(months), 36); i++) { const f = Math.min(1, months - i); s += `<div class="month${f >= 1 ? " full" : ""}"><i style="height:${f * 100}%"></i><span>${i + 1}か月</span></div>`; }
      viz.innerHTML = s + "</div>";
      leg.innerHTML = `<span><span class="sw" style="background:var(--accent)"></span>1マス＝1か月（1日8時間×20日）</span>`;
    } else {
      let s = '<div class="hours-viz">';
      const cells = Math.max(1, Math.ceil(h));
      for (let d = 0; d < Math.ceil(cells / 8); d++) {
        s += '<div class="day">';
        for (let k = 0; k < 8; k++) { const f = Math.max(0, Math.min(1, h - (d * 8 + k))); s += `<span class="cell">${f > 0 ? `<i style="width:${Math.max(f * 100, 8)}%"></i>` : ""}</span>`; }
        s += "</div>";
      }
      viz.innerHTML = s + "</div>";
      leg.innerHTML = `<span><span class="sw" style="background:var(--accent)"></span>1マス＝1時間</span><span>8マスで1日</span>`;
    }
    const h15 = it.p15 / D.MINWAGE[2015], h25 = it.p25 / D.MINWAGE[2025];
    $("tn15").textContent = hmText(h15); $("tn15s").textContent = `${yen(it.p15)}円 ÷ 時給798円`;
    $("tn25").textContent = hmText(h25); $("tn25s").textContent = `${yen(it.p25)}円 ÷ 時給1,121円`;
    const d = (h25 / h15 - 1) * 100;
    let t;
    if (Math.abs(d) < 3) t = `値段は ${sgn(pct(it.p15, it.p25))} 上がりましたが、時給も上がったので、<b>買うのにかかる時間はほぼ同じ</b>です。`;
    else if (d < 0) t = `値段は ${sgn(pct(it.p15, it.p25))} 上がりましたが、時給はそれ以上に上がったので、<b>買うのにかかる時間は${Math.round(-d)}%短く</b>なりました。10年前より買いやすくなっています。`;
    else t = `値段の上がり方（${sgn(pct(it.p15, it.p25))}）が時給の上がり方（+40%）より大きいので、<b>買うのにかかる時間は${Math.round(d)}%長く</b>なりました。10年前より買いにくくなっています。`;
    if (it.n) t += ` <span class="note-flag">条件変更</span> ${esc(it.spec)}`;
    $("tnText").innerHTML = t;
    drawTrend(it);
  }
  // 4時点の値段（棒＋折れ線）。棒の高さは値段、上に数字
  function drawTrend(it) {
    const tr = D.TREND[it.id] || [null, null];
    const vals = [tr[0], it.p15, tr[1], it.p25];
    const W = 560, H = 170, M = { l: 12, r: 12, t: 26, b: 26 };
    const max = Math.max(...vals.filter((v) => v != null)) * 1.12;
    const bw = 64, gap = (W - M.l - M.r - bw * 4) / 3;
    const X = (i) => M.l + i * (bw + gap), Y = (v) => M.t + (1 - v / max) * (H - M.t - M.b);
    let s = `<line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" stroke="var(--line)"/>`;
    vals.forEach((v, i) => {
      const y = D.TREND_YEARS[i], x = X(i);
      s += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle">${y}年</text>`;
      if (v == null) { s += `<text x="${x + bw / 2}" y="${H - M.b - 10}" text-anchor="middle">比べられない</text>`; return; }
      const last = i === 3;
      s += `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${H - M.b - Y(v)}" rx="4" fill="${last ? "var(--ruler)" : "var(--soft)"}"/>`;
      s += `<text class="p" x="${x + bw / 2}" y="${Y(v) - 8}" text-anchor="middle">${yen(v)}円</text>`;
    });
    $("trendChart").innerHTML = s;
    let note = `東京23区の年平均。`;
    if (vals[2] != null) { const c = (it.p25 / vals[2] - 1) * 100; note += `2020年から2025年の5年間で ${sgn(c)}。`; }
    if (vals[0] != null) { const c = (vals[1] / vals[0] - 1) * 100; note += `2010年から2015年は ${sgn(c)} でした。`; }
    if (it.id === "rice" || it.id === "onigiri") note += "ここ数年で急に上がったことがわかります。";
    if (vals.includes(null)) note += "「比べられない」年は、調べる品物の条件が大きくちがうため出していません。";
    $("trendNote").textContent = note;
  }
  // さがす機能から、品物をえらんで開けるように
  D.OK.selectItem = (id) => { const it = D.ITEMS.find((i) => i.id === id); if (!it) return; cur = id; group = it.g; store.set("item", cur); store.set("group", group); renderGrid(); renderHours(); };
  // さがす機能から、品物をえらんで開けるように
  D.OK.selectItem = (id) => { const it = D.ITEMS.find((i) => i.id === id); if (!it) return; cur = id; group = it.g; store.set("item", cur); store.set("group", group); renderGrid(); renderHours(); };
  D.OK.onUnit(renderHours);
  renderGrid(); renderHours();

  // ===== 02 値上がりランキング =====
  $("avgPct").textContent = sgn(AVG10, 1);
  let rGroup = "all", rSel = "rice";
  const rankChips = $("rankChips");
  [["all", "ぜんぶ"], ...Object.entries(D.GROUPS)].forEach(([k, v]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.g = k; b.textContent = v;
    b.addEventListener("click", () => { rGroup = k; renderRank(); });
    rankChips.appendChild(b);
  });
  function renderRank() {
    [...rankChips.children].forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.g === rGroup)));
    const rows = D.ITEMS.filter((i) => rGroup === "all" || i.g === rGroup).map((i) => ({ ...i, c: pct(i.p15, i.p25) })).sort((a, b) => b.c - a.c);
    const all = D.ITEMS.map((i) => pct(i.p15, i.p25));
    const lo = Math.min(-10, ...all), hi = Math.max(...all) + 4;
    const X = (v) => ((v - lo) / (hi - lo)) * 100;
    const list = $("rankList"); list.innerHTML = "";
    rows.forEach((r) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "rank-row"; b.setAttribute("aria-pressed", String(r.id === rSel));
      const left = Math.min(X(0), X(r.c)), width = Math.abs(X(r.c) - X(0));
      const color = r.c > AVG10 ? "var(--hot)" : "var(--cool)";
      b.innerHTML = `<span class="nm">${esc(r.name)}</span>
        <span class="track"><span class="zero" style="left:${X(0)}%"></span><span class="bar${r.c < 0 ? " neg" : ""}" style="left:${left}%;width:${Math.max(width, .6)}%;background:${color}"></span><span class="axis" style="left:${X(AVG10)}%"></span></span>
        <span class="pc">${sgn(r.c)}</span>`;
      b.addEventListener("click", () => { rSel = r.id; renderRank(); });
      list.appendChild(b);
    });
    const s = D.ITEMS.find((i) => i.id === rSel) || rows[0];
    const c = pct(s.p15, s.p25);
    $("rankDetail").innerHTML = `<div><b>${esc(s.name)}</b>（${esc(s.unit)}）${s.n ? '<span class="note-flag">条件変更</span>' : ""}</div>
      <div>2015年 <b class="num">${yen(s.p15)}円</b> → 2025年 <b class="num">${yen(s.p25)}円</b>（${sgn(c)}）。物価全体の平均（${sgn(AVG10, 1)}）の <b class="num">${(c / AVG10).toFixed(1)}倍</b> の上がり方です。</div>
      <div class="hint">調べ方：${esc(s.spec)}</div>`;
  }
  renderRank();

  // ===== 08 ことば辞典 =====
  const realMW = (D.MINWAGE[2025] / D.MINWAGE[2015]) / (cpiAt("総合", 2025) / cpiAt("総合", 2015));
  const WORDS = [
    { w: "物価", r: "ぶっか", p: "いろいろな物やサービスの値段を、まとめて見たもの。ひとつの品物の値段ではなく「全体として」高いか安いかを表します。", ex: `2015年から2025年までに、物価は${sgn(AVG10, 1)}上がりました。` },
    { w: "消費者物価指数", r: "しょうひしゃぶっかしすう", p: "国（総務省統計局）が毎月発表する、物価の「ものさし」。ある年を100として、ほかの年がいくつかで表します。英語の頭文字でCPIとも言います。", ex: "今は2025年＝100。1990年は80.1なので、そのころは今より約2割安かったことになります。" },
    { w: "インフレ・デフレ", r: "", p: "物価が上がり続けることをインフレ、下がり続けることをデフレと言います。日本は1990年代の終わりから、物価がほとんど上がらない時代が長く続きました。", ex: "2022年ごろから、日本はふたたびインフレの時代に入りました。" },
    { w: "名目と実質", r: "めいもく・じっしつ", p: "金額そのものが名目、物価の動きを差し引いて「どれだけ買えるか」で見たものが実質です。", ex: `最低賃金は10年で名目+40%、実質では約${sgn((realMW - 1) * 100)}でした。` },
    { w: "最低賃金", r: "さいていちんぎん", p: "法律で決められた、時給の最低ライン。これより低い時給で人をやとってはいけません。都道府県ごとに毎年決まります。", ex: "2026年度の全国平均は1,177円。いちばん高い都道府県は1,280円、低い県は1,085円です。" },
    { w: "額面と手取り", r: "がくめん・てどり", p: "会社が決めた給料が額面、税金や保険料が引かれたあと口座に入るのが手取りです。", ex: "大学卒の初任給の平均262,300円なら、1年目の手取りはおよそ22万円です。" },
    { w: "社会保険", r: "しゃかいほけん", p: "病気、老後、失業など、だれにでも起こりうることに、みんなでお金を出しあって備えるしくみ。健康保険・年金・雇用保険などがあります。", ex: "保険料の多くは、はたらく人と会社が半分ずつ払います。" },
    { w: "基準年", r: "きじゅんねん", p: "物価指数で「100」にする年のこと。5年ごとに新しくなります。2026年から、2025年が基準年になりました。", ex: "基準年が変わっても、年と年の比べ方（何％上がったか）はほとんど変わりません。" },
    { w: "家計調査", r: "かけいちょうさ", p: "国（総務省統計局）が、全国の約9千世帯に家計簿をつけてもらい、収入や支出を調べる統計。毎月発表されます。", ex: "2人以上で暮らす家族が2025年に使ったお金は、平均で月314,001円でした。" },
    { w: "エンゲル係数", r: "えんげるけいすう", p: "使ったお金のうち、食べ物に使った割合。食べ物は節約しにくいので、物価が上がると高くなりやすい数字です。", ex: "2025年は28.6%。1981年以来、44年ぶりの高さでした。" },
    { w: "相関係数", r: "そうかんけいすう", p: "2つの数字が一緒に増えたり減ったりする関係の強さを、−1から1で表したもの。1に近いほど「片方が大きいともう片方も大きい」関係です。", ex: "おにぎりの値段と最低賃金の相関係数は0.18。ほとんど関係がありません。" },
    { w: "72の法則", r: "ななじゅうにのほうそく", p: "72を「1年あたりの上がり方（%）」でわると、2倍になるまでのおおよその年数がわかる計算のコツ。", ex: "物価が毎年3%上がると、72÷3＝24年で値段は約2倍になります。" },
  ];
  $("wordGrid").innerHTML = WORDS.map((x) => `<div class="word"><span class="w">${x.w}</span>${x.r ? `<span class="r">${x.r}</span>` : ""}<p>${x.p}</p><span class="ex">${x.ex}</span></div>`).join("");

  // ===== 章ナビのハイライト =====
  const links = [...document.querySelectorAll("#chapters a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("section.ch").forEach((s) => io.observe(s));
  }
})();
