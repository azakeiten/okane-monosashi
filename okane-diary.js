// おかねの物差し：わたしのおこづかい帳（記録はこのブラウザの中だけに保存）
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const SITE = "https://azakeiten.github.io/okane-monosashi/";
  const CATS = [
    { k: "snack", t: "おやつ・食べ物", c: "var(--seg3)", r: 8 },
    { k: "fun", t: "あそび・ゲーム", c: "var(--seg5)", r: 10 },
    { k: "study", t: "文ぼう具・本", c: "var(--seg1)", r: 10 },
    { k: "wear", t: "ふく・身の回り", c: "var(--seg4)", r: 10 },
    { k: "other", t: "そのほか", c: "var(--muted)", r: 10 },
    { k: "save", t: "ちょきん", c: "var(--good)", r: 0 },
  ];
  const cat = (k) => CATS.find((c) => c.k === k) || CATS[4];
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date(), thisMonth = ymd(today).slice(0, 7);

  // はじめて開いたときは、使い方がわかるように「例」を表示する（自分の記録を入れると消える）
  function sample() {
    const m = thisMonth;
    return [
      { d: `${m}-02`, n: "おにぎり", a: 176, c: "snack" }, { d: `${m}-03`, n: "ノート", a: 207, c: "study" },
      { d: `${m}-05`, n: "ガチャガチャ", a: 300, c: "fun" }, { d: `${m}-06`, n: "ポテトチップス", a: 150, c: "snack" },
      { d: `${m}-08`, n: "マンガ", a: 594, c: "study" }, { d: `${m}-09`, n: "ちょきん箱へ", a: 1000, c: "save" },
    ].map((e, i) => ({ ...e, id: "ex" + i, ex: true }));
  }
  let list = store.get("diary", null);
  if (!Array.isArray(list)) list = sample();
  let view = thisMonth, curCat = "snack";
  const save = () => store.set("diary", list);

  CATS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.k = c.k; b.innerHTML = `${c.t}<span class="num">${c.r ? "消費税" + c.r + "%" : "使わずにためる"}</span>`;
    b.addEventListener("click", () => { curCat = c.k; paintCats(); });
    $("dyCat").appendChild(b);
  });
  const paintCats = () => [...$("dyCat").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === curCat)));
  $("dyDate").value = ymd(today);

  $("dyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = $("dyName").value.trim(), a = Math.round(parseFloat($("dyAmt").value));
    if (!n || !(a > 0)) { $("dyMsg").textContent = "買ったものと金額を入れてください。"; return; }
    list = list.filter((x) => !x.ex); // 自分の記録をはじめたら、例は消す
    const d = $("dyDate").value || ymd(today);
    list.push({ id: Date.now().toString(36), d, n, a, c: curCat });
    save(); view = d.slice(0, 7);
    $("dyMsg").textContent = `「${n}」${yen(a)}円を記録しました。`;
    $("dyName").value = ""; $("dyAmt").value = ""; $("dyName").focus();
    render();
  });
  $("dySample").addEventListener("click", () => { list = list.filter((x) => !x.ex); save(); render(); });
  const shift = (k) => { const [y, m] = view.split("-").map(Number); const d = new Date(y, m - 1 + k, 1); view = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; render(); };
  $("dyPrev").addEventListener("click", () => shift(-1));
  $("dyNext").addEventListener("click", () => shift(1));

  function month() { return list.filter((x) => x.d.slice(0, 7) === view).sort((a, b) => b.d.localeCompare(a.d)); }
  function stats(items) {
    const by = {}; CATS.forEach((c) => (by[c.k] = 0));
    items.forEach((x) => (by[x.c] = (by[x.c] || 0) + x.a));
    const spend = items.filter((x) => x.c !== "save").reduce((s, x) => s + x.a, 0);
    const tax = items.reduce((s, x) => { const r = cat(x.c).r; return s + (r ? x.a * r / (100 + r) : 0); }, 0);
    return { by, spend, saved: by.save || 0, tax: Math.floor(tax) };
  }
  function render() {
    const [y, m] = view.split("-").map(Number), items = month(), s = stats(items), w = D.OK.wage(), allow = D.OK.allow();
    const ex = list.some((x) => x.ex);
    $("dyMonthL").textContent = `${y}年${m}月${view === thisMonth ? "（今月）" : ""}に使ったお金${ex ? "（例）" : ""}`;
    $("dyTotal").innerHTML = `${yen(s.spend)}<span class="u">円</span>`;
    $("dySub").innerHTML = items.length ? `おこづかい（月${yen(allow)}円）の<b>${Math.round(s.spend / allow * 100)}%</b>。のこりは<b>${yen(Math.max(0, allow - s.spend - s.saved))}円</b>${s.saved ? `、ちょきんは${yen(s.saved)}円` : ""}です。` : "この月の記録はまだありません。";
    const spendCats = CATS.filter((c) => c.k !== "save" && s.by[c.k] > 0);
    $("dyBar").innerHTML = spendCats.map((c) => `<div style="flex:${s.by[c.k]};background:${c.c}" title="${c.t} ${yen(s.by[c.k])}円"></div>`).join("");
    $("dyLegend").innerHTML = spendCats.map((c) => `<span class="box" style="--c:${c.c}">${c.t} ${Math.round(s.by[c.k] / (s.spend || 1) * 100)}%</span>`).join("");
    const food = s.spend ? s.by.snack / s.spend * 100 : 0;
    const K = D.KAKEI, ky = K["食料"].length - 1, fam = K["食料"][ky] / K["消費支出"][ky] * 100;
    $("dyFacts").innerHTML = items.length ? [
      { k: "払った消費税", v: `約${yen(s.tax)}円`, s: "食べ物8%、それ以外10%で計算" },
      { k: "はたらく時間にすると", v: hmText(s.spend / w), s: `時給${yen(w)}円の場合` },
      { k: "食べ物の割合", v: `${Math.round(food)}%`, s: `家族の家計では約${Math.round(fam)}%（家計調査）` },
      { k: "いちばん多い使い道", v: spendCats.length ? spendCats.slice().sort((a, b) => s.by[b.k] - s.by[a.k])[0].t : "—", s: spendCats.length ? `${yen(Math.max(...spendCats.map((c) => s.by[c.k])))}円` : "" },
    ].map((f) => `<div><span class="k">${f.k}</span><span class="v">${esc(f.v)}</span><span class="s">${esc(f.s)}</span></div>`).join("") : "";
    $("dyList").innerHTML = items.length ? items.map((x) => { const c = cat(x.c); return `<li class="${x.ex ? "ex" : ""}"><span class="sw" style="background:${c.c}"></span><span class="d">${+x.d.slice(5, 7)}/${+x.d.slice(8)}</span><span class="n">${esc(x.n)}<small>${c.t}${x.ex ? "・例" : ""}</small></span><span class="a">${x.c === "save" ? "ちょきん " : ""}${yen(x.a)}円</span><button type="button" class="x" data-id="${x.id}" aria-label="${esc(x.n)}を消す">×</button></li>`; }).join("") : `<li class="none">左のフォームから記録してみよう</li>`;
    $("dyList").querySelectorAll(".x").forEach((b) => b.addEventListener("click", () => { list = list.filter((x) => x.id !== b.dataset.id); save(); render(); }));
    $("dySample").hidden = !ex;
    $("dyCopied").textContent = "";
  }
  $("dyCopy").addEventListener("click", () => {
    const [y, m] = view.split("-").map(Number), items = month(), s = stats(items);
    const lines = CATS.filter((c) => s.by[c.k] > 0).map((c) => `・${c.t}：${yen(s.by[c.k])}円`);
    D.OK.copy(`【${y}年${m}月のおこづかい帳】\n使ったお金：${yen(s.spend)}円（消費税 約${yen(s.tax)}円）\n${lines.join("\n")}\n#おかねの物差し ${SITE}#diary`, $("dyCopied"));
  });

  paintCats();
  D.OK.onUnit(render);
  render();
})();
