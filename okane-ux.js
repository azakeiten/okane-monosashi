// おかねの物差し：見やすさの道具（もくじ・この章のポイント・かんたん表示・次の章へ・上へもどる）
(() => {
  const D = window, { $, yen, esc, store, sgn, cpiAt, hmText, AVG10 } = D.OK;

  // ===== かんたん表示 =====
  const easyBtn = $("easyToggle");
  const setSimple = (on) => { document.body.classList.toggle("simple", on); easyBtn.setAttribute("aria-pressed", String(on)); store.set("simple", on); };
  setSimple(store.get("simple", false));
  easyBtn.addEventListener("click", () => setSimple(!document.body.classList.contains("simple")));

  // ===== あなたの物差し（バーの文字と、ヘッダーから開く） =====
  const wrap = $("unitWrap");
  function unitSummary() {
    const p = D.OK.pref();
    $("unitSummary").textContent = `${p >= 0 ? D.OK.prefName(p) + "・" : ""}時給${yen(D.OK.wage())}円・おこづかい月${yen(D.OK.allow())}円`;
  }
  $("unitPill").addEventListener("click", () => { wrap.open = true; });
  D.OK.onUnit(unitSummary); unitSummary();

  // ===== 各章の答え（数字はすべてデータから） =====
  const item = (id) => D.ITEMS.find((i) => i.id === id);
  const pmin = D.CITY.onigiri.map((p, i) => p == null ? null : p / D.PREF_WAGE[i] * 60).filter((v) => v != null);
  const top = D.ITEMS.map((i) => ({ ...i, c: (i.p25 / i.p15 - 1) * 100 })).sort((a, b) => b.c - a.c)[0];
  const K = D.KAKEI, KY = D.KAKEI_FIRST_YEAR, ky1 = KY + K["消費支出"].length - 1;
  const ANSWERS = {
    hours: () => `時給${yen(D.OK.wage())}円なら、おにぎり1個は<b>${hmText(item("onigiri").p25 / D.OK.wage())}</b>、お米5kgは<b>${hmText(item("rice").p25 / D.OK.wage())}</b>はたらくと買えます。`,
    map: () => `おにぎり1個を買うのにはたらく時間は、県によって<b>${hmText(Math.min(...pmin) / 60)}</b>から<b>${hmText(Math.max(...pmin) / 60)}</b>までちがいます。`,
    rank: () => `10年でいちばん値上がりしたのは<b>${esc(top.name)}（${sgn(top.c)}）</b>。物価全体の上がり方は<b>${sgn(AVG10, 1)}</b>でした。`,
    time: () => `1990年の物価は今の<b>約${Math.round(cpiAt("総合", 1990) / 10)}割</b>。今の1,000円の買い物は、1990年なら<b>約${yen(1000 * cpiAt("総合", 1990) / 100)}円</b>です。`,
    race: () => { const w = D.MINWAGE[2025] / D.MINWAGE[2002], c = cpiAt("総合", 2025) / cpiAt("総合", 2002); return `2002年から2025年で、最低賃金は<b>${w.toFixed(2)}倍</b>、物価は<b>${c.toFixed(2)}倍</b>。最低賃金で買えるものは増えました。`; },
    kakei: () => `家族は1か月に平均<b>${yen(K["消費支出"][ky1 - KY] / 12)}円</b>を使い、そのうち<b>約${Math.round(K["食料"][ky1 - KY] / K["消費支出"][ky1 - KY] * 10)}割</b>が食べ物です。`,
    save: () => `物価が毎年2%上がると、1万円で買えるものは10年後に<b>約${yen(Math.round(10000 / Math.pow(1.02, 10) / 100) * 100)}円ぶん</b>に減ります。`,
    pay: () => { const r = D.OK.calcPay(262300, 1); return `大学卒の初任給<b>262,300円</b>でも、口座に入るのは<b>約${Math.round(r.net / 10000)}万円</b>。約<b>${Math.round((1 - r.net / 262300) * 100)}%</b>が税金と保険料です。`; },
    school: () => { const g = (id) => D.SCHOOL.find((s) => s.id === id).total; return `1年の学習費は、公立小学校で<b>約${Math.round(g("es-pub") / 1e4)}万円</b>、私立小学校で<b>約${Math.round(g("es-pri") / 1e4)}万円</b>。公立小学校では、塾や習いごとのお金がいちばん多くなっています。`; },
    agewage: () => { const A = D.AGEWAGE, pk = A.all.indexOf(Math.max(...A.all)); return `20〜24歳の給料は平均<b>月${yen(A.all[1] * 1000)}円</b>。いちばん多いのは${A.ages[pk]}の<b>月${yen(A.all[pk] * 1000)}円</b>（約${(A.all[pk] / A.all[1]).toFixed(1)}倍）で、60歳をすぎると下がります。`; },
    big: () => { const P = D.POPULATION.value, m = (v) => (v / P / 1e4).toLocaleString("ja-JP", { maximumFractionDigits: 1 }); return `国の予算122.3兆円は、1人あたり<b>約${m(D.BIG[0].value)}万円</b>。国の借金1,145兆円は、1人あたり<b>約${Math.round(D.BIG[3].value / P / 1e4).toLocaleString()}万円</b>です。`; },
    fx: () => { const F = D.FX, y1 = D.FX_FIRST_YEAR + F.length - 1, lo = Math.min(...F), ly = D.FX_FIRST_YEAR + F.indexOf(lo), now = F[F.length - 1]; return `${y1}年の1ドルは平均<b>${now.toFixed(1)}円</b>。いちばん円高だった${ly}年（${lo.toFixed(1)}円）の約${(now / lo).toFixed(1)}倍で、100ドルの物は<b>約${yen(100 * lo)}円→約${yen(100 * now)}円</b>になりました。`; },
    tax: () => { const p = item("onigiri").p25, t = Math.floor(p * 8 / 108); return `おにぎり${p}円の中に、消費税は<b>約${t}円</b>（8%）。国の税金でいちばん多いのが<b>消費税 ${(D.TAXREV.consumption / 1e12).toFixed(1)}兆円</b>です。`; },
    diary: () => `使ったお金を記録すると、<b>使い道の割合</b>・<b>払った消費税</b>・<b>はたらく時間</b>が自動でわかる、自分だけの家計簿です。`,
    quiz: () => `<b>4つのモード</b>（値上がり・何時間・日本地図・昔の値段）で力だめし。答えはぜんぶ本物の統計です。`,
    words: () => `ニュースでよく聞く<b>${document.querySelectorAll(".word").length}</b>のことばを、このサイトの数字で説明します。`,
    sheet: () => `サイトで答えをさがす<b>6問</b>と、近くのお店の値段しらべ。自由研究や授業に使えます。`,
  };
  const IDS = Object.keys(ANSWERS);
  const secs = IDS.map((id) => $(id)).filter(Boolean);
  secs.forEach((s) => {
    const head = s.querySelector(".ch-head"); if (!head) return;
    const t = document.createElement("div"); t.className = "takeaway"; t.innerHTML = `<span class="tk">この章のポイント</span><p data-ans="${s.id}"></p>`;
    head.appendChild(t);
    const note = document.createElement("p"); note.className = "easy-note"; note.textContent = "かんたん表示中：くわしい説明はたたんであります。上の「かんたん表示」をもう一度押すと全部見られます。";
    s.querySelector(".wrap").appendChild(note);
  });
  function renderAnswers() { document.querySelectorAll("[data-ans]").forEach((p) => { p.innerHTML = ANSWERS[p.dataset.ans](); }); renderToc(); }

  // ふりがな（rt）を除いた見出しの文字
  function plain(el) { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent.trim(); }

  // ===== 4つのパート =====
  const PARTS = [
    { t: "自分の時間で、くらべる", d: "値段を「はたらく時間」に直して、品物や都道府県をくらべます。", ids: ["hours", "map", "rank"] },
    { t: "昔と今を、さかのぼる", d: "物価・給料・貯金の価値・円の値打ちが、時代とともにどう変わったかを見ます。", ids: ["time", "race", "save", "fx"] },
    { t: "くらしの、しくみを知る", d: "家族と自分のお金の使い道、学校にかかるお金、給料から引かれるお金、国の大きなお金、消費税のしくみ。", ids: ["kakei", "school", "pay", "agewage", "big", "tax", "diary"] },
    { t: "わかったことを、たしかめる", d: "クイズ、ことば辞典、自由研究ワークシート、スタンプラリーで、ふりかえりましょう。", ids: ["quiz", "words", "sheet"] },
  ];
  const chNo = (id) => { const s = $(id), b = s && s.querySelector(".rule-band span"); return b ? +b.textContent : ""; };
  const chTitle = (id) => plain($(id).querySelector(".ch-head h2"));
  // 本文の中に、パートの帯を入れる
  PARTS.forEach((p, i) => {
    const first = $(p.ids[0]); if (!first) return;
    const band = document.createElement("div");
    band.className = "part-band"; band.id = "part" + (i + 1);
    band.innerHTML = `<div class="wrap"><span class="pn">PART ${i + 1}</span><div><h2>${p.t}</h2><p>${p.d}</p></div><nav class="chs" aria-label="パート${i + 1}の章">${p.ids.map((id) => `<a href="#${id}">${D.OK.icon ? D.OK.icon(id, 15) : ""}${String(chNo(id)).padStart(2, "0")} ${esc(chTitle(id).replace(/[？?].*$/, "？"))}</a>`).join("")}</nav></div>`;
    first.parentNode.insertBefore(band, first);
  });

  // ===== もくじ =====
  function card(id, no, title, ans, done) {
    const ic = D.OK.icon ? D.OK.icon(id, 24) : "";
    return `<a class="toc-card" href="#${id}"><span class="no">${ic || no}</span><span class="tq">${ic && typeof no === "number" ? `<small class="tn">${String(no).padStart(2, "0")}</small>` : ""}${esc(title)}</span><span class="ta">${ans}</span>${done ? '<span class="done">読んだ</span>' : ""}</a>`;
  }
  function renderToc() {
    const got = new Set(store.get("stamps", []));
    $("tocGrid").innerHTML = PARTS.map((p, i) => {
      const cards = p.ids.map((id) => card(id, chNo(id), chTitle(id), ANSWERS[id](), got.has(id)));
      if (i === PARTS.length - 1) cards.push(card("stamps", "★", "物差しスタンプラリー", `章を読むとスタンプ。<b>${got.size}/16</b>こ集めると「物差しはかせ」に認定。`, false));
      return `<div class="toc-part"><div class="toc-part-h"><span class="pn">PART ${i + 1}</span><b>${p.t}</b><span class="d">${p.d}</span></div><div class="toc-grid" style="--cols:${cards.length}">${cards.join("")}</div></div>`;
    }).join("") + `<p class="hint" style="margin-top:14px">数字はぜんぶ、国や公的機関の統計です。くわしくは<a href="#sources">データの出どころ</a>へ。</p>`;
  }

  // ===== たとえば、こんなことがわかります =====
  function renderExamples() {
    const w = D.OK.wage(), tot = K["消費支出"][ky1 - KY] / 12;
    const ex = [
      { id: "hours", q: "お米5kgを買うには、何時間はたらく？", a: hmText(item("rice").p25 / w).replace("約", ""), s: `時給${yen(w)}円・東京23区の値段で` },
      { id: "map", q: "おにぎり1個、県によってはたらく時間は？", a: `${Math.round(Math.min(...pmin))}〜${Math.round(Math.max(...pmin))}<small>分</small>`, s: "47都道府県の最低賃金と値段で" },
      { id: "time", q: "今の1,000円の買い物、1990年ならいくら？", a: `${yen(1000 * cpiAt("総合", 1990) / 100)}<small>円</small>`, s: "消費者物価指数で計算" },
      { id: "kakei", q: "家族が1か月に使うお金は？", a: `${(tot / 10000).toFixed(1)}<small>万円</small>`, s: "2人以上の世帯・2025年平均" },
    ];
    $("exGrid").innerHTML = ex.map((e) => `<a class="ex-card" href="#${e.id}"><span class="q">${e.q}</span><span class="a">${e.a}</span><span class="s">${e.s}</span></a>`).join("");
  }
  D.OK.onUnit(renderExamples);
  renderExamples();
  document.addEventListener("okane:stamp", renderToc);

  // ===== 次の章へ =====
  const all = [...document.querySelectorAll("section.ch")];
  all.forEach((s, i) => {
    const nx = all[i + 1]; if (!nx) return;
    const h = nx.querySelector(".ch-head h2, h2"), num = nx.querySelector(".rule-band span");
    const div = document.createElement("div"); div.className = "next-ch";
    div.innerHTML = `<a href="#${nx.id}"><span><small>次の章${num ? " " + num.textContent : ""}</small>${esc(plain(h))}</span><span class="arw" aria-hidden="true">↓</span></a>`;
    s.querySelector(".wrap").appendChild(div);
  });

  // ===== 上へもどる =====
  const tt = $("toTop");
  const onScroll = () => { tt.hidden = window.scrollY < 900; };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  D.OK.onUnit(renderAnswers);
  renderAnswers();

  // ===== アプリのような画面切りかえ（ホーム＋4つのパート） =====
  const home = document.querySelector("main > .wrap");
  const VIEWS = { home: { els: [home], t: "ホーム", s: "ホーム", i: "円" } };
  PARTS.forEach((p, i) => {
    const els = [$("part" + (i + 1)), ...p.ids.map((id) => $(id))];
    if (i === PARTS.length - 1) els.push($("stamps"), $("sources"));
    VIEWS["part" + (i + 1)] = { els: els.filter(Boolean), t: p.t, s: ["くらべる", "さかのぼる", "しくみ", "たしかめる"][i], i: String(i + 1) };
  });
  const ORDER = Object.keys(VIEWS);
  // パートの最後の章の「次の章へ」は、下の「次のパートへ」と重なるので消す
  PARTS.forEach((p) => { const last = $(p.ids[p.ids.length - 1]); const n = last && last.querySelector(".next-ch"); if (n) n.remove(); });
  // 画面の下の「前へ・次へ」
  ORDER.forEach((v, k) => {
    const els = VIEWS[v].els, lastEl = els[els.length - 1];
    const prev = ORDER[k - 1], next = ORDER[k + 1];
    const foot = document.createElement("div"); foot.className = "wrap view-foot";
    foot.innerHTML = (prev ? `<a href="#${prev}"><span>←</span><span><small>前へ</small>${esc(VIEWS[prev].t)}</span></a>` : "") +
      (next ? `<a class="nx" href="#${next}"><span><small>${v === "home" ? "さあ、はじめよう" : "次のパートへ"}</small>${next === "home" ? "ホーム" : "PART " + VIEWS[next].i + " " + esc(VIEWS[next].t)}</span><span>→</span></a>` : `<a class="nx" href="#home"><span><small>さいしょにもどる</small>ホーム</span><span>→</span></a>`);
    lastEl.after(foot); els.push(foot);
  });
  // タブバー
  const tabbar = document.createElement("nav");
  tabbar.className = "tabbar"; tabbar.setAttribute("aria-label", "画面の切りかえ");
  tabbar.innerHTML = ORDER.map((v) => `<a href="#${v}" data-v="${v}"><span class="ti">${VIEWS[v].i}</span><span class="tl">${v === "home" ? "ホーム" : "PART " + VIEWS[v].i + "　" + esc(VIEWS[v].t)}</span><span class="tl-s">${VIEWS[v].s}</span></a>`).join("");
  // パソコンでは上のバーの中、スマホでは画面の下（ヘッダーのぼかし効果の外に出す）
  const mq = matchMedia("(max-width: 760px)");
  const placeTabbar = () => { (mq.matches ? document.body : document.querySelector(".top .wrap")).appendChild(tabbar); };
  placeTabbar();
  mq.addEventListener ? mq.addEventListener("change", placeTabbar) : mq.addListener(placeTabbar);
  document.body.classList.add("app");

  const viewOf = (el) => ORDER.find((v) => VIEWS[v].els.some((e) => e === el || e.contains(el)));
  let cur = null;
  function go(v, targetId, push) {
    if (!VIEWS[v]) v = "home";
    if (v !== cur) {
      ORDER.forEach((k) => VIEWS[k].els.forEach((e) => { e.hidden = k !== v; }));
      VIEWS[v].els.forEach((e) => { e.classList.remove("view-in"); void e.offsetWidth; e.classList.add("view-in"); });
      tabbar.querySelectorAll("a").forEach((a) => { if (a.dataset.v === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
      cur = v; store.set("view", v);
    }
    // 画面のいちばん上の要素なら先頭へ、それ以外はその場所へ
    const t = targetId && $(targetId);
    if (t && VIEWS[v].els[0] !== t) t.scrollIntoView({ block: "start", behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    if (push !== false) { try { history.pushState({ v, t: targetId || null }, "", "#" + (targetId || v)); } catch (e) {} }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    let id = a.getAttribute("href").slice(1); if (!id) return;
    if (id === "top") id = "home";
    if (VIEWS[id]) { e.preventDefault(); go(id); return; }
    const el = $(id); if (!el) return;
    const v = viewOf(el); if (!v) return;
    e.preventDefault(); go(v, id === "myunit" ? "unitWrap" : id);
  });
  window.addEventListener("popstate", (e) => { const s = e.state; if (s && s.v) go(s.v, s.t, false); else route(false); });
  function route(push) {
    const h = decodeURIComponent(location.hash.slice(1));
    if (VIEWS[h]) return go(h, null, push);
    const el = h && $(h);
    if (el && viewOf(el)) return go(viewOf(el), h, push);
    go("home", null, push);
  }
  route(false);
})();
