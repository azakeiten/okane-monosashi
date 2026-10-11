// おかねの物差し：00 そもそも、お金ってなに？（物々交換の物差し・硬貨のひみつ）
(() => {
  const D = window, { $, yen, esc, store } = D.OK;
  const item = (id) => D.ITEMS.find((i) => i.id === id);

  // ===== 物々交換の物差し =====
  const A = $("bxA"), B = $("bxB");
  D.ITEMS.forEach((it) => { [A, B].forEach((s) => { const o = document.createElement("option"); o.value = it.id; o.textContent = `${it.name}（${it.unit}・${yen(it.p25)}円）`; s.appendChild(o); }); });
  A.value = store.get("bxA", "rice"); B.value = store.get("bxB", "notebook");
  [A, B].forEach((s) => s.addEventListener("change", () => { store.set("bxA", A.value); store.set("bxB", B.value); renderBarter(); }));
  function renderBarter() {
    const a = item(A.value), b = item(B.value), n = a.p25 / b.p25;
    $("bxLabel").textContent = `${a.name}（${a.unit}）1つと同じ値打ちなのは`;
    // 数えることば（冊・個・本…）は、品物の単位から取る。わからないときは「つ」
    const m = b.unit.match(/(冊|個|杯|皿|本|足|枚|台|回|ゲーム|パック|袋)/), ctr = m ? m[1] : "つ";
    $("bxValue").innerHTML = `${b.name} ${n >= 10 ? Math.round(n).toLocaleString() : n.toFixed(1)}<span class="u">${ctr}分</span>`;
    // 1つ＝1マス（多いときは最大60マス）
    const shown = Math.min(60, Math.ceil(n)), whole = Math.floor(Math.min(n, 60));
    let s = `<i class="one" title="${esc(a.name)} 1つ"></i>`;
    for (let k = 0; k < shown; k++) s += k < whole ? "<i></i>" : `<i class="part"><b style="width:${(n - whole) * 100}%"></b></i>`;
    $("bxPile").innerHTML = s;
    $("bxSub").innerHTML = `${yen(a.p25)}円 ÷ ${yen(b.p25)}円 ＝ ${n.toFixed(2)}。黄色のマスが${esc(a.name)}1つ、青いマスが${esc(b.name)}1つです${n > 60 ? "（多いので60こまで表示）" : ""}。お金がなかったら、このくらいの${esc(b.name)}を持ち歩いて交換しなければなりません。`;
  }

  // ===== 硬貨のひみつ =====
  let coin = store.get("coin", 1);
  D.COINS.forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.dataset.v = c.v; b.innerHTML = `${c.name}<span class="num">${c.g.toFixed(2)}g・直径${c.d}mm</span>`; b.addEventListener("click", () => { coin = c.v; store.set("coin", coin); renderCoins(); }); $("cnSeg").appendChild(b); });
  $("cnAmt").addEventListener("input", renderCoins);
  const kg = (g) => g >= 1000 ? `${(g / 1000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}kg` : `${Math.round(g).toLocaleString()}g`;
  const len = (mm) => mm >= 1e6 ? `約${(mm / 1e6).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}km` : mm >= 1000 ? `約${(mm / 1000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}m` : `約${(mm / 10).toFixed(1)}cm`;
  function renderCoins() {
    [...$("cnSeg").children].forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === coin)));
    const c = D.COINS.find((x) => x.v === coin), amt = Math.max(0, Math.floor(parseFloat($("cnAmt").value) || 0));
    const n = Math.floor(amt / c.v), rest = amt - n * c.v, g = n * c.g, mm = n * c.d;
    $("cnLabel").textContent = `${yen(amt)}円を、全部${c.name}にすると`;
    $("cnValue").innerHTML = `${n.toLocaleString()}<span class="u">枚</span>`;
    const bills = Math.floor(amt / 10000);
    $("cnGrid").innerHTML = [
      { k: "重さ", v: kg(g), s: g >= 2000 ? `2Lのペットボトルの水 約${(g / 2000).toFixed(1)}本ぶん` : "手で持てる重さ" },
      { k: "横にならべると", v: len(mm), s: mm >= 25000 ? `25mプールの約${(mm / 25000).toFixed(1)}ぱいぶん` : `直径${c.d}mmの硬貨を${n.toLocaleString()}枚` },
      { k: "あまり", v: rest ? `${yen(rest)}円` : "なし", s: rest ? `${c.name}ではおつりなしで払えない分` : "ぴったり" },
      { k: "お札なら", v: bills ? `1万円札 ${bills.toLocaleString()}枚・約${bills}g` : "1万円未満", s: "お札は1枚約1g。だからお札は便利" },
    ].map((x) => `<div><span class="k">${x.k}</span><span class="v">${esc(x.v)}</span><span class="s">${esc(x.s)}</span></div>`).join("");
  }

  renderBarter(); renderCoins();
})();
