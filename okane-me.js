// おかねの物差し：あなたの物差しカード・自由研究ワークシート
(() => {
  const D = window, { $, yen, esc, store, hmText, cpiAt } = D.OK;
  const SITE = "https://azakeiten.github.io/okane-monosashi/";
  const item = (id) => D.ITEMS.find((i) => i.id === id);

  // ===== あなたの物差しカード =====
  const mcPref = $("mcPref"), mcBirth = $("mcBirth"), mcName = $("mcName");
  D.PREFS.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${D.OK.prefName(i)}（${yen(D.PREF_WAGE[i])}円）`; mcPref.appendChild(o); });
  mcBirth.value = store.get("birth", ""); mcName.value = store.get("cardName", "");
  mcPref.addEventListener("change", () => {
    if (mcPref.value !== "") D.OK.setPref(+mcPref.value);
    else { $("prefSel").value = ""; $("wageIn").value = 1177; $("wageIn").dispatchEvent(new Event("input")); }
  });
  mcBirth.addEventListener("input", () => { store.set("birth", mcBirth.value); renderAll(); });
  mcName.addEventListener("input", () => { store.set("cardName", mcName.value); renderCard(); });

  const birth = () => { const y = parseInt(mcBirth.value, 10); return y >= D.CPI_FIRST_YEAR && y <= 2025 ? y : null; };
  // 選んだ県の県庁所在地の値段（なければ東京23区）
  function cityPrice(id) { const p = D.OK.pref(); const v = p >= 0 && D.CITY[id] ? D.CITY[id][p] : null; return v != null ? { v, where: D.PREFS[p].city } : { v: item(id).p25, where: "東京23区" }; }
  function facts() {
    const w = D.OK.wage(), p = D.OK.pref(), y = birth();
    const oni = cityPrice("onigiri"), rice = cityPrice("rice");
    const per = D.BIG[0].value / D.POPULATION.value;
    const r = {
      wage: { k: "あなたの時給", v: `${yen(w)}<small>円</small>`, s: p >= 0 && D.PREF_WAGE[p] === w ? `${D.OK.prefName(p)}の最低賃金（2026年度）` : w === 1177 ? "全国平均の最低賃金（2026年度）" : "自分で入れた時給", t: `時給：${yen(w)}円` },
      oni: { k: "おにぎり1個を買うには", v: hmText(oni.v / w).replace("約", ""), s: `${esc(oni.where)}の値段 ${yen(oni.v)}円（2025年平均）`, t: `おにぎり1個（${oni.where}・${yen(oni.v)}円）：${hmText(oni.v / w)}` },
      rice: { k: "お米5kgを買うには", v: hmText(rice.v / w).replace("約", ""), s: `${esc(rice.where)}の値段 ${yen(rice.v)}円（2025年平均）`, t: `お米5kg（${rice.where}・${yen(rice.v)}円）：${hmText(rice.v / w)}` },
      budget: { k: "国の予算、1人あたり", v: `${(per / 1e4).toFixed(1)}<small>万円</small>`, s: `時給${yen(w)}円で約${Math.round(per / w).toLocaleString()}時間ぶん`, t: `国の予算の1人あたり：約${(per / 1e4).toFixed(1)}万円（約${Math.round(per / w).toLocaleString()}時間ぶん）` },
    };
    if (y) {
      const now = 1000 * 100 / cpiAt("総合", y), up = (100 / cpiAt("総合", y) - 1) * 100;
      r.birth = { k: `生まれた${y}年の1,000円の買い物`, v: `${yen(now)}<small>円</small>`, s: `今はこれくらいかかる（物価は${up >= 0 ? "+" : ""}${up.toFixed(1)}%）`, t: `${y}年の1,000円の買い物は、今は約${yen(now)}円（物価${up >= 0 ? "+" : ""}${up.toFixed(1)}%）` };
      if (D.MINWAGE[y]) r.mw = { k: `${y}年度の最低賃金（全国平均）`, v: `${yen(D.MINWAGE[y])}<small>円</small>`, s: `今は${yen(D.MINWAGE[2026])}円。${(D.MINWAGE[2026] / D.MINWAGE[y]).toFixed(2)}倍になった`, t: `${y}年度の最低賃金：${yen(D.MINWAGE[y])}円 → 2026年度は${yen(D.MINWAGE[2026])}円` };
    }
    return r;
  }
  // カードの色（4色）。画像にするときも同じ色を使う
  const THEMES = [["navy", "紺", "#191f45"], ["green", "みどり", "#0f4a3a"], ["purple", "むらさき", "#35225e"], ["brown", "あかちゃ", "#5a2a18"]];
  let theme = store.get("cardTheme", "navy");
  const themeColor = () => (THEMES.find((t) => t[0] === theme) || THEMES[0])[2];
  $("mcTheme").innerHTML = THEMES.map(([k, t, c]) => `<button type="button" data-t="${k}" style="--c:${c}"><i></i>${t}</button>`).join("");
  $("mcTheme").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (!b) return; theme = b.dataset.t; store.set("cardTheme", theme); renderCard(); });
  // スタンプとバッジの数（このブラウザに残っている記録から）
  const prog = () => ({ st: store.get("stamps", []).length, stAll: document.querySelectorAll("#stampGrid .stamp").length || 17, bd: store.get("badges", []).length, bdAll: D.OK.badgeTotal || 20 });
  function renderCard() {
    const f = facts(), p = D.OK.pref(), y = birth(), name = mcName.value.trim();
    [...$("mcTheme").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === theme)));
    $("mcCard").style.setProperty("--mc-bg", themeColor()); $("mcCard").dataset.themeC = theme;
    mcPref.value = p >= 0 ? String(p) : "";
    let rows = [f.wage, f.oni, f.rice, f.birth, f.mw, f.budget].filter(Boolean);
    if (rows.length % 2) rows = rows.slice(0, -1); // 2列できれいにならぶよう、偶数にする
    const pg = prog(); $("mcCard").innerHTML = `<span class="mc-mascot">${D.OK.mascot ? D.OK.mascot("smile", 54) : ""}</span><div class="mc-top"><span class="mc-name">${esc(name || "あなた")}の物差しカード</span><span class="mc-sub">${p >= 0 ? esc(D.OK.prefName(p)) : "全国"}${y ? `・${y}年生まれ` : ""}</span></div>
      <div class="mc-rows">${rows.map((r) => `<div class="mc-row"><span class="k">${r.k}</span><span class="v">${r.v}</span><span class="s">${r.s}</span></div>`).join("")}</div>
      <div class="mc-prog"><span>スタンプ<b>${pg.st}/${pg.stAll}</b></span><span>バッジ<b>${pg.bd}/${pg.bdAll}</b></span></div>
      ${y ? "" : '<p class="mc-empty">生まれた年を入れると、「生まれた年の1,000円は今いくら？」も出ます。</p>'}`;
    $("mcCopied").textContent = "";
  }
  $("mcCopy").addEventListener("click", () => {
    const f = facts(), name = mcName.value.trim();
    const lines = [f.wage, f.oni, f.rice, f.birth, f.mw, f.budget].filter(Boolean).map((r) => "・" + r.t);
    D.OK.copy(`【${name || "わたし"}の物差しカード】\n${lines.join("\n")}\n#おかねの物差し ${SITE}`, $("mcCopied"));
  });

  // ===== カードを画像にする（1080×1350）。GitHub版のふつうのページでだけ使える =====
  function cardRows() { const f = facts(); let rows = [f.wage, f.oni, f.rice, f.birth, f.mw, f.budget].filter(Boolean); if (rows.length % 2) rows = rows.slice(0, -1); return rows; }
  const strip = (h) => String(h).replace(/<[^>]+>/g, "");
  async function drawCard() {
    try { await document.fonts.ready; } catch (e) {}
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), NAVY = "#191f45", PAPER = "#f2f3f7", YEL = "#f4b400", DISP = '"Dela Gothic One", "Hiragino Sans", "Yu Gothic", sans-serif', BODY = '"Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", sans-serif', NUM = '"DM Mono", monospace';
    const BG = themeColor(); g.fillStyle = BG; g.fillRect(0, 0, W, H);
    // 上：ロゴと名前
    g.fillStyle = YEL; g.fillRect(72, 72, 64, 64);
    g.fillStyle = BG; g.font = `40px ${DISP}`; g.textBaseline = "middle"; g.textAlign = "center"; g.fillText("円", 104, 106);
    drawMascot(g, W - 72 - 130, 36, 130, BG);
    g.textAlign = "left"; g.fillStyle = PAPER; g.font = `34px ${DISP}`; g.fillText("おかねの物差し", 160, 106);
    const p = D.OK.pref(), y = birth(), name = mcName.value.trim() || "あなた";
    g.font = `66px ${DISP}`; g.fillStyle = PAPER; g.textBaseline = "alphabetic";
    g.fillText(`${name}の物差しカード`.slice(0, 15), 72, 250);
    g.font = `32px ${BODY}`; g.fillStyle = "rgba(242,243,247,.75)";
    g.fillText(`${p >= 0 ? D.OK.prefName(p) : "全国"}${y ? `・${y}年生まれ` : ""}`, 72, 306);
    // まん中：数字のマス（2列）
    const rows = cardRows(), colW = (W - 72 * 2 - 24) / 2, rowH = 230, top = 360;
    rows.forEach((r, i) => {
      const x = 72 + (i % 2) * (colW + 24), yy = top + Math.floor(i / 2) * (rowH + 24);
      g.fillStyle = "rgba(242,243,247,.09)"; roundRect(g, x, yy, colW, rowH, 24); g.fill();
      g.fillStyle = "rgba(242,243,247,.75)"; g.font = `26px ${BODY}`; g.fillText(strip(r.k).slice(0, 18), x + 28, yy + 56);
      const v = String(r.v).replace(/<small>(.*?)<\/small>/, "\u0001$1").split("\u0001");
      g.fillStyle = YEL; g.font = `64px ${DISP}`; g.fillText(strip(v[0]), x + 28, yy + 140);
      if (v[1]) { const wv = g.measureText(strip(v[0])).width; g.fillStyle = PAPER; g.font = `32px ${DISP}`; g.fillText(strip(v[1]), x + 34 + wv, yy + 140); }
      g.fillStyle = "rgba(242,243,247,.7)"; g.font = `22px ${BODY}`; wrap(g, strip(r.s), x + 28, yy + 186, colW - 56, 30, 2);
    });
    // スタンプとバッジ
    const pg = prog(); g.font = `28px ${BODY}`; g.fillStyle = "rgba(242,243,247,.85)"; g.textAlign = "left";
    g.fillText(`スタンプ ${pg.st}/${pg.stAll}　・　バッジ ${pg.bd}/${pg.bdAll}`, 72, H - 190);
    // 下：物差しの帯とURL
    g.fillStyle = YEL; g.fillRect(0, H - 150, W, 150);
    g.strokeStyle = BG; g.lineWidth = 3;
    for (let i = 0; i <= 54; i++) { const x = 30 + i * 19; const h = i % 10 === 0 ? 50 : i % 5 === 0 ? 34 : 20; g.beginPath(); g.moveTo(x, H - 150); g.lineTo(x, H - 150 + h); g.stroke(); }
    g.fillStyle = BG; g.font = `30px ${NUM}`; g.fillText("azakeiten.github.io/okane-monosashi", 72, H - 44);
    g.font = `24px ${BODY}`; g.textAlign = "right"; g.fillText("数字は国の統計から", W - 72, H - 44);
    return new Promise((ok) => c.toBlob((b) => ok(b), "image/png"));
  }
  // ものさしくん（画像用）
  function drawMascot(g, x, y, s, ink) {
    const k = s / 64; g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = "#f4b400"; roundRect(g, 9, 8, 46, 50, 13); g.fill(); g.strokeStyle = ink; g.lineWidth = 2.6; g.stroke();
    g.lineWidth = 2; g.lineCap = "round"; [16, 22, 28, 34, 40, 46].forEach((tx, i) => { g.beginPath(); g.moveTo(tx, 56); g.lineTo(tx, 56 - (i % 2 ? 4 : 7)); g.stroke(); });
    g.fillStyle = "rgba(196,88,10,.35)"; [18.5, 45.5].forEach((cx) => { g.beginPath(); g.ellipse(cx, 34, 3.6, 2.4, 0, 0, Math.PI * 2); g.fill(); });
    g.lineWidth = 2.6; [25, 39].forEach((cx) => { g.beginPath(); g.moveTo(cx - 3.4, 27); g.quadraticCurveTo(cx, 23.4, cx + 3.4, 27); g.stroke(); });
    g.beginPath(); g.moveTo(26, 34); g.quadraticCurveTo(32, 40.5, 38, 34); g.stroke(); g.restore();
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function wrap(g, text, x, y, maxW, lh, maxLines) { let line = "", n = 0; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y + n * lh); line = ch; if (++n >= maxLines) return; } else line += ch; } if (line) g.fillText(line, x, y + n * lh); }
  const framedPage = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (framedPage) {
    $("mcImgNote").innerHTML = `画像で保存するときは、<a href="${SITE}#mycard" target="_blank" rel="noopener">GitHub版のサイト</a>を開いてください。`;
  } else {
    $("mcSave").hidden = false;
    $("mcSave").addEventListener("click", async () => {
      const b = await drawCard(); if (!b) return;
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "monosashi-card.png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      $("mcCopied").textContent = "画像を保存しました。";
    });
    // スマホで「送る」（使える端末だけ）
    try {
      const test = new File([new Blob(["x"])], "t.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [test] })) {
        $("mcShare").hidden = false;
        $("mcShare").addEventListener("click", async () => {
          const b = await drawCard(); if (!b) return;
          try { await navigator.share({ files: [new File([b], "monosashi-card.png", { type: "image/png" })], title: "わたしの物差しカード", text: `#おかねの物差し ${SITE}` }); } catch (e) {}
        });
      }
    } catch (e) {}
  }
  D.OK.drawCard = drawCard;

  // ===== 自由研究ワークシート =====
  // 章の番号と見出し（ページから読むので、章がふえても番号がずれない）
  function chLabel(id) { const s = $(id); if (!s) return id; const n = s.querySelector(".rule-band span"), h = s.querySelector(".ch-head h2"); const c = h ? h.cloneNode(true) : null; if (c) c.querySelectorAll("rt").forEach((r) => r.remove()); return `${n ? n.textContent + " " : ""}${c ? c.textContent.trim() : id}`; }
  let showAns = false;
  function renderSheet() {
    const f = facts(), y = birth(), r = D.OK.calcPay(262300, 1);
    const top = D.ITEMS.map((i) => ({ ...i, c: (i.p25 / i.p15 - 1) * 100 })).sort((a, b) => b.c - a.c)[0];
    const p = D.OK.pref();
    const QS = [
      { q: "あなたの住んでいる都道府県の、2026年度の最低賃金はいくら？", u: "円", a: p >= 0 ? `${yen(D.PREF_WAGE[p])}（${D.OK.prefName(p)}）` : "（都道府県をえらぶと表示）", h: "map", hn: "02 日本地図" },
      { q: "おにぎり1個を買うには、あなたの県の最低賃金で何分はたらく？", u: "分", a: f.oni.t.split("：")[1].replace("約", "").replace("分", ""), h: "map", hn: "02 日本地図" },
      { q: "2015年から2025年までに、いちばん値上がりした品物は何？ 何％上がった？", u: "", a: `${top.name}（+${Math.round(top.c)}%）`, h: "rank", hn: "03 値上がりランキング" },
      { q: "あなたが生まれた年に、今の1,000円の買い物はいくらだった？", u: "円", a: y ? `${yen(1000 * cpiAt("総合", y) / 100)}（${y}年）` : "（生まれた年を入れると表示）", h: "time", hn: "04 物価タイムマシン" },
      { q: "国の予算（一般会計）は、日本に住む1人あたりいくら？", u: "円", a: `約${yen(D.BIG[0].value / D.POPULATION.value)}`, h: "big", hn: "09 1人あたりいくら？" },
      { q: "大学卒の初任給（額面）262,300円のとき、手取り（1年目）はおよそいくら？", u: "円", a: `約${yen(r.net)}`, h: "pay", hn: "08 手取りのひみつ" },
      { q: "国の1年のお金を1万円にちぢめると、社会保障に使われるのはいくら？", u: "円", a: D.BUDGET ? yen((D.BUDGET.out.find((x) => x.id === "social").v / D.BUDGET.total) * 10000) : "", h: "big", hn: "12 国の家計簿" },
      { q: "幼稚園から高校まで、ぜんぶ公立に通うと、学校にかかるお金（学習費）は合計いくら？", u: "万円", a: `約${yen(D.SCHOOL.filter((s) => /-pub$/.test(s.id)).reduce((t, s) => t + s.total * s.y, 0) / 1e4)}`, h: "agewage", hn: "11 一生のお金すごろく" },
    ];
    $("sheetQs").innerHTML = QS.map((x) => `<li><span class="qt">${x.q}</span><span class="blank"><i>${showAns ? esc(x.a) : ""}</i>${x.u}</span><span class="qh hint">ヒント：<a href="#${x.h}">${chLabel(x.h)}</a></span></li>`).join("");
  }
  $("sheetFill").addEventListener("click", () => { showAns = !showAns; $("sheetFill").setAttribute("aria-pressed", String(showAns)); $("sheetFill").textContent = showAns ? "答えの例をかくす" : "答えの例を表示する"; renderSheet(); });
  // 印刷は、GitHub版のふつうのページでだけ使える（Claudeのプレビューの中では印刷できない）
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (framed) {
    $("sheetPrint").hidden = true;
    $("sheetNote").innerHTML = `印刷は、<a href="${SITE}#sheet" target="_blank" rel="noopener">GitHub版のサイト</a>で使えます。`;
  } else {
    $("sheetNote").textContent = "A4の紙1〜2枚に、ワークシートだけが印刷されます。";
    $("sheetPrint").addEventListener("click", () => { document.body.classList.add("print-sheet"); window.print(); });
    window.addEventListener("afterprint", () => document.body.classList.remove("print-sheet"));
  }

  function renderAll() { renderCard(); renderSheet(); }
  D.OK.onUnit(renderAll);
  renderAll();
  document.addEventListener("okane:badge", renderCard); document.addEventListener("okane:stamp", renderCard);
})();
