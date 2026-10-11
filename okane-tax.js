// おかねの物差し：消費税（レシート）・ほしい物までの貯金計画・数字の動き
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const SITE = "https://azakeiten.github.io/okane-monosashi/";
  const item = (id) => D.ITEMS.find((i) => i.id === id);

  // ===== 10 消費税 =====
  let eat = store.get("taxEat", "in");
  let basket = store.get("basket", { onigiri: 1, choco: 1, burger: 1, notebook: 1 });
  const rateOf = (it) => (it.g === "food" || it.g === "snack") ? 8 : it.g === "eatout" ? (eat === "out" ? 8 : 10) : 10;
  const CHIP_IDS = ["onigiri", "rice", "milk", "chips", "choco", "ice", "water", "burger", "gyudon", "coffee", "notebook", "pen", "battery", "shoes"];
  CHIP_IDS.forEach((id) => {
    const it = item(id); if (!it) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.id = id;
    b.innerHTML = `${esc(it.name)}<span class="num">${yen(it.p25)}円</span>`;
    b.addEventListener("click", () => { basket[id] = (basket[id] || 0) + 1; save(); renderReceipt(); });
    $("taxChips").appendChild(b);
  });
  $("taxEat").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; eat = b.dataset.v; store.set("taxEat", eat); renderReceipt(); });
  $("taxClear").addEventListener("click", () => { basket = {}; save(); renderReceipt(); });
  const save = () => store.set("basket", basket);
  const today = (() => { const d = new Date(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; })();

  function renderReceipt() {
    [...$("taxEat").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === eat)));
    [...$("taxChips").children].forEach((c) => c.setAttribute("aria-pressed", String(!!basket[c.dataset.id])));
    const lines = Object.entries(basket).filter(([, n]) => n > 0).map(([id, n]) => ({ it: item(id), n })).filter((l) => l.it);
    let html = `<div class="shop">ものさしマート</div><div class="date">${today}　レシート</div><hr>`;
    if (!lines.length) {
      html += `<div class="empty">左の品物を押して、かごに入れよう</div>`;
      $("receipt").innerHTML = html; return;
    }
    const sum = { 8: 0, 10: 0 };
    lines.forEach((l) => {
      const r = rateOf(l.it), amt = l.it.p25 * l.n; sum[r] += amt;
      html += `<div class="ln"><span class="nm">${r === 8 ? "※" : "　"}${esc(l.it.name)}${l.n > 1 ? ` ×${l.n}` : ""}</span><span>¥${yen(amt)}</span></div>`;
    });
    // 値段は消費税こみなので、中にふくまれる税は「値段 × 税率 ÷ (100 + 税率)」（1円未満は切りすて）
    const tax8 = Math.floor(sum[8] * 8 / 108), tax10 = Math.floor(sum[10] * 10 / 110), total = sum[8] + sum[10];
    html += `<hr><div class="ln tot"><span>合計</span><span>¥${yen(total)}</span></div>`;
    if (sum[8]) html += `<div class="ln"><span>（8%対象 ¥${yen(sum[8])}）</span><span class="tax">内税 ¥${yen(tax8)}</span></div>`;
    if (sum[10]) html += `<div class="ln"><span>（10%対象 ¥${yen(sum[10])}）</span><span class="tax">内税 ¥${yen(tax10)}</span></div>`;
    html += `<div class="note">※は軽減税率（8%）の対象です。値段は東京23区の2025年平均。</div>`;
    const t = tax8 + tax10, w = D.OK.wage();
    html += `<div class="big-tax">この買い物で払った消費税は <b>¥${yen(t)}</b>。合計の約${Math.round(t / total * 1000) / 10}%で、あなたの時給（${yen(w)}円）なら${hmText(t / w)}ぶんです。</div>`;
    $("receipt").innerHTML = html;
  }

  const taxAllow = $("taxAllow"), taxMix = $("taxMix");
  taxAllow.value = store.get("allow", 3000);
  [taxAllow, taxMix].forEach((el) => el.addEventListener("input", renderYear));
  function renderYear() {
    const a = Math.max(0, parseFloat(taxAllow.value) || 0), m = +taxMix.value / 100;
    $("taxMixL").textContent = taxMix.value;
    const y8 = a * 12 * m, y10 = a * 12 * (1 - m);
    const t8 = y8 * 8 / 108, t10 = y10 * 10 / 110, tax = t8 + t10;
    const nat = t8 * D.TAXRATE.reducedNational / 8 + t10 * D.TAXRATE.stdNational / 10;
    $("taxYear").innerHTML = `${yen(tax)}<span class="u">円</span>`;
    $("taxYearSub").innerHTML = a ? `1年で使う${yen(a * 12)}円のうち、約<b>${yen(tax)}円</b>が消費税です。そのうち約${yen(nat)}円が国へ、約${yen(tax - nat)}円が都道府県と市区町村へ行きます。` : "金額を入れてください。";
  }

  const R = D.TAXREV, other = R.total - R.consumption - R.income - R.corporate;
  $("taxBar").innerHTML = [[R.consumption, "var(--seg3)", "消費税"], [R.income, "var(--seg1)", "所得税"], [R.corporate, "var(--seg6)", "法人税"], [other, "var(--muted)", "その他"]].map(([v, c, t]) => `<div style="flex:${v};background:${c}" title="${t} ${(v / 1e12).toFixed(1)}兆円"></div>`).join("");
  $("taxBarText").innerHTML = `いちばん多いのは<b>消費税 ${(R.consumption / 1e12).toFixed(1)}兆円</b>（${Math.round(R.consumption / R.total * 100)}%）。次が所得税 ${(R.income / 1e12).toFixed(1)}兆円、法人税 ${(R.corporate / 1e12).toFixed(1)}兆円です。消費税は、日本に住む1人あたり約${Math.round(R.consumption / D.POPULATION.value / 1e4 * 10) / 10}万円になります。`;

  // ===== 06 ほしい物まで、あと何か月？ =====
  const gP = $("goalPrice"), gS = $("goalSave"), gB = $("goalStart"), gI = $("goalInf");
  [["スニーカー", item("shoes").p25], ["自転車", item("bike").p25], ["ゲーム機（例）", 49980]].forEach(([n, v]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.v = v;
    b.innerHTML = `${n}<span class="num">${yen(v)}円</span>`;
    b.addEventListener("click", () => { gP.value = v; renderGoal(); });
    $("goalChips").appendChild(b);
  });
  [gP, gS, gB, gI].forEach((el) => el.addEventListener("input", renderGoal));
  function months(P, S, B, inf) {
    for (let n = 0; n <= 600; n++) { if (B + S * n >= P * (inf ? Math.pow(1.02, n / 12) : 1)) return n; }
    return null;
  }
  const ym = (n) => n < 12 ? `${n}か月` : `${Math.floor(n / 12)}年${n % 12 ? n % 12 + "か月" : ""}`;
  function renderGoal() {
    const P = Math.max(1, parseFloat(gP.value) || 1), S = Math.max(0, parseFloat(gS.value) || 0), B = Math.max(0, parseFloat(gB.value) || 0), inf = gI.checked;
    [...$("goalChips").children].forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.v === P)));
    const a = D.OK.allow();
    $("goalSaveHint").textContent = `おこづかい（月${yen(a)}円）の約${Math.round(S / a * 100)}%`;
    const n = months(P, S, B, inf), n0 = months(P, S, B, false);
    const d = new Date(); if (n != null) d.setMonth(d.getMonth() + n);
    if (n === 0) { $("goalValue").innerHTML = `今すぐ<span class="u">買える！</span>`; $("goalSub").textContent = "今ある貯金で、もう足りています。"; }
    else if (n == null) { $("goalValue").innerHTML = `とどかない`; $("goalSub").textContent = S ? "物の値段が上がる速さに、貯金が追いつきません。毎月ためる金額をふやしてみよう。" : "毎月ためる金額を入れてください。"; }
    else {
      $("goalValue").innerHTML = ym(n).replace(/(\d+)/g, "$1").replace("年", '<span class="u">年</span>').replace("か月", '<span class="u">か月</span>');
      let t = `${d.getFullYear()}年${d.getMonth() + 1}月ごろに買えます（あと${yen(Math.max(0, P - B))}円）。`;
      if (inf && n > n0) t += ` 物の値段が毎年2%上がると、そのころは約${yen(P * Math.pow(1.02, n / 12))}円になるので、上がらない場合より${n - n0}か月長くかかります。`;
      $("goalSub").textContent = t;
    }
    const f = Math.min(1, B / P);
    $("goalTrack").innerHTML = `<div class="fill" style="width:${f * 100}%"></div><div class="lbl"><span>今 ${yen(B)}円（${Math.round(f * 100)}%）</span><span>ゴール ${yen(P)}円</span></div>`;
    $("goalCopied").textContent = "";
  }
  $("goalCopy").addEventListener("click", () => {
    const P = parseFloat(gP.value) || 0, S = parseFloat(gS.value) || 0, B = parseFloat(gB.value) || 0, n = months(P, S, B, gI.checked);
    D.OK.copy(`【貯金計画】${yen(P)}円のほしい物まで、毎月${yen(S)}円ためて${n == null ? "とどかない" : n === 0 ? "今すぐ買える" : "あと" + ym(n)}！\n#おかねの物差し ${SITE}#save`, $("goalCopied"));
  });

  // ===== 数字が変わったら、ふわっと出す =====
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "MutationObserver" in window) {
    const mo = new MutationObserver((ms) => ms.forEach((m) => {
      const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      const v = el && el.closest(".answer .value, .conv-cell .v, .mc-row .v");
      if (!v) return; v.classList.remove("bump"); void v.offsetWidth; v.classList.add("bump");
    }));
    document.querySelectorAll(".answer .value, .conv-cell .v").forEach((el) => mo.observe(el, { childList: true, characterData: true, subtree: true }));
    const card = $("mcCard"); if (card) mo.observe(card, { childList: true, subtree: true });
  }

  D.OK.onUnit(() => { renderReceipt(); renderGoal(); });
  renderReceipt(); renderYear(); renderGoal();
})();
