// おかねの物差し：ニュースの大きな数字を1人あたりに・結果をコピー
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const SITE = "https://azakeiten.github.io/okane-monosashi/";
  const POP = D.POPULATION.value;
  // 長い時間は分を出さない（例：約847時間）
  const hrsText = (h) => h >= 100 ? `約${Math.round(h).toLocaleString()}時間` : hmText(h);
  const popText = `${Math.floor(POP / 1e8)}億${Math.round((POP % 1e8) / 1e4).toLocaleString()}万人`;

  // ===== 結果をコピー（どの章からも使える） =====
  D.OK.copy = (text, statusEl) => {
    const done = (ok) => { if (statusEl) { statusEl.textContent = ok ? "コピーしました。LINEやメモに貼りつけて送れます。" : "コピーできませんでした。下の文を長押しして選んでください。"; } };
    const fallback = () => { if (statusEl) { statusEl.innerHTML = `<span style="user-select:all;display:block;margin-top:6px">${esc(text)}</span>`; } };
    try {
      navigator.clipboard.writeText(text).then(() => done(true), () => { done(false); fallback(); });
    } catch (e) { done(false); fallback(); }
  };

  // 円の金額を、読みやすい日本語に（例：9,333,225 → 約933万円、1.2兆 → 約1.2兆円）
  function jp(v) {
    if (v >= 1e12) return `約${(v / 1e12).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}兆円`;
    if (v >= 1e8) return `約${(v / 1e8).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}億円`;
    if (v >= 1e4) return `約${(v / 1e4).toLocaleString("ja-JP", { maximumFractionDigits: v >= 1e6 ? 0 : 1 })}万円`;
    return `約${yen(v)}円`;
  }
  // 1万円札の高さ（100万円で約1cm）→ メートル
  const heightM = (v) => v / 1e8;
  function len(m) { return m >= 1000 ? `約${(m / 1000).toLocaleString("ja-JP", { maximumFractionDigits: m >= 1e5 ? 0 : 1 })}km` : m >= 1 ? `約${m.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}m` : `約${(m * 100).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}cm`; }

  let sel = store.get("big", "budget");
  const seg = $("bigSeg"), input = $("bigIn"), unit = $("bigUnit");
  D.BIG.forEach((b) => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.dataset.id = b.id; btn.innerHTML = `${esc(b.name)}<span class="num">${b.short}</span>`;
    btn.addEventListener("click", () => { sel = b.id; store.set("big", sel); input.value = b.value / 1e12; unit.value = "1e12"; render(); });
    seg.appendChild(btn);
  });
  const cur = D.BIG.find((b) => b.id === sel) || D.BIG[0];
  input.value = +(cur.value / 1e12).toFixed(4);
  [input, unit].forEach((el) => el.addEventListener("input", () => { sel = "custom"; render(); }));

  function value() { const v = parseFloat(input.value); return isFinite(v) && v > 0 ? v * +unit.value : 0; }
  function render() {
    const v = value(), b = D.BIG.find((x) => x.id === sel), w = D.OK.wage();
    [...seg.children].forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.id === sel)));
    $("bigNote").textContent = b ? `${b.note}。` : "自分で入れた金額です。";
    const per = v / POP;
    $("bigPer").innerHTML = v ? `${jp(per).replace("約", "")}` : "—";
    $("bigPerSub").innerHTML = v ? `${jp(v).replace("約", "")} ÷ 日本の人口 ${popText}。` : "金額を入れてください。";
    const hrs = per / w;
    const cells = [
      { k: "4人家族あたり", v: jp(per * 4), s: "1人あたり × 4人" },
      { k: `あなたの時給（${yen(w)}円）だと`, v: hrsText(hrs), s: hrs >= 8 ? `1日8時間で約${Math.round(hrs / 8).toLocaleString()}日ぶん` : "1人ぶんをかせぐ時間" },
    ];
    if (b && b.kind === "stock") cells.push({ k: "国の予算の何年分？", v: `約${(v / D.BIG[0].value).toFixed(1)}年分`, s: "一般会計122.3兆円の何倍か" });
    else cells.push({ k: "1人・1日あたり", v: jp(per / 365), s: "1年を365日でわると" });
    cells.push({ k: "1万円札を積み上げると", v: len(heightM(v)), s: "100万円の札たば ≒ 約1cm" });
    $("bigGrid").innerHTML = cells.map((c) => `<div><span class="k">${esc(c.k)}</span><span class="v">${esc(c.v)}</span><span class="s">${esc(c.s)}</span></div>`).join("");
    $("bigCopied").textContent = "";
    drawStack(v, b ? b.name : "入れた金額");
  }
  $("bigCopy").addEventListener("click", () => {
    const v = value(); if (!v) return;
    const b = D.BIG.find((x) => x.id === sel), name = b ? `${b.name}${b.short}` : jp(v);
    const per = v / POP, hrs = per / D.OK.wage();
    D.OK.copy(`${name}は、日本に住む1人あたり${jp(per)}。時給${yen(D.OK.wage())}円ではたらくと${hrsText(hrs)}ぶんです。\n#おかねの物差し ${SITE}#big`, $("bigCopied"));
  });

  // 高さくらべ（横棒）。ほかのものと一緒に並べる
  function drawStack(v, name) {
    const items = [
      { n: "富士山", m: 3776, ref: 1 },
      { n: "国際宇宙ステーションまで", m: 400000, ref: 1 },
      { n: "国の予算 122.3兆円", m: heightM(D.BIG[0].value) },
      { n: "日本のGDP 663.5兆円", m: heightM(D.BIG[4].value) },
      { n: "国の借金 1,145兆円", m: heightM(D.BIG[3].value) },
      { n: "地球の直径", m: 12742000, ref: 1 },
    ];
    const mine = heightM(v);
    if (v && !D.BIG.some((x) => Math.abs(x.value - v) < 1 && [0, 3, 4].includes(D.BIG.indexOf(x)))) items.push({ n: name.length > 14 ? "入れた金額" : name, m: mine, me: 1 });
    items.sort((a, b) => a.m - b.m);
    const W = 760, rowH = 32, top = 8, L = 200, R = 120, H = top + items.length * rowH + 8;
    const max = Math.max(...items.map((i) => i.m));
    const X = (m) => Math.max(3, (m / max) * (W - L - R));
    let s = "";
    items.forEach((it, i) => {
      const y = top + i * rowH, isSel = it.me || (!it.ref && Math.abs(it.m - mine) < 1e-6);
      const fill = it.ref ? "var(--soft)" : isSel ? "var(--ruler)" : "var(--cool)";
      s += `<text class="lb" x="${L - 10}" y="${y + 20}" text-anchor="end">${esc(it.n)}</text>`;
      s += `<rect x="${L}" y="${y + 6}" width="${X(it.m)}" height="20" rx="4" fill="${fill}" ${it.ref ? 'stroke="var(--line)"' : ""}/>`;
      s += `<text class="vl" x="${L + X(it.m) + 8}" y="${y + 20}">${len(it.m)}</text>`;
    });
    const svg = $("stackChart"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = s;
    const debt = heightM(D.BIG[3].value);
    $("stackNote").textContent = `国の借金1,145兆円を1万円札で積み上げると${len(debt)}。地球の直径（約12,742km）の約${Math.round(debt / 12742000 * 100)}%、富士山の約${Math.round(debt / 3776).toLocaleString()}倍の高さです。`;
  }

  // 予算の使い道
  const bud = D.BIG[0].value, soc = D.BIG[1].value, dp = D.BIG[2].value, oth = bud - soc - dp;
  $("budgetBar").innerHTML = [[soc, "var(--seg1)", "社会保障"], [dp, "var(--seg3)", "国債費"], [oth, "var(--muted)", "それ以外"]].map(([x, c, t]) => `<div style="flex:${x};background:${c}" title="${t} ${jp(x)}"></div>`).join("");
  $("budgetText").innerHTML = `社会保障が<b>${Math.round(soc / bud * 100)}%</b>（1人あたり${jp(soc / POP)}）、借金の返済と利息が<b>${Math.round(dp / bud * 100)}%</b>（1人あたり${jp(dp / POP)}）。残りの<b>${Math.round(oth / bud * 100)}%</b>で、地方へのお金、公共事業、教育、防衛などをまかなっています。`;

  // 1兆の大きさ
  const yrs = 1e12 / (60 * 60 * 24 * 365);
  $("trillionFact").textContent = `1秒に1円ずつ数えても、1兆円を数え終わるには約${Math.round(yrs).toLocaleString()}年かかります。今から約${Math.round(yrs).toLocaleString()}年前は、まだ氷河期のころです。`;

  // ホームの換算機にもコピーボタン
  const conv = document.querySelector(".converter");
  if (conv) {
    const row = document.createElement("div"); row.className = "share-row conv-share";
    row.innerHTML = `<button type="button" class="btn ghost" id="heroCopy">結果をコピーする</button><span class="hint" id="heroCopied" aria-live="polite"></span>`;
    conv.appendChild(row);
    $("heroCopy").addEventListener("click", () => {
      const p = parseFloat($("heroPrice").value) || 0; if (!p) return;
      const w = D.OK.wage();
      D.OK.copy(`${yen(p)}円は、時給${yen(w)}円ではたらくと${hmText(p / w)}ぶん。おこづかい月${yen(D.OK.allow())}円なら${(p / D.OK.allow()).toFixed(1)}か月ぶんです。\n#おかねの物差し ${SITE}`, $("heroCopied"));
    });
    $("heroPrice").addEventListener("input", () => { $("heroCopied").textContent = ""; });
  }

  D.OK.onUnit(render);
  render();
})();
