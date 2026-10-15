// おかねの物差し：わたしのおこづかい物価。使い道の割合で、自分にとっての10年間の値上がり率を計算する
(() => {
  const D = window, { $, yen, esc, store, cpiAt } = D.OK;
  const box = $("miBox"); if (!box) return;
  const Y0 = 2015, Y1 = 2025;
  const CAT = [
    { id: "snack", t: "おやつ・おかし", c: "菓子類" },
    { id: "eat", t: "買い食い・外食", c: "外食" },
    { id: "food", t: "そのほかの食べ物・飲み物", c: "食料" },
    { id: "fun", t: "あそび・本・ゲーム", c: "教養娯楽" },
    { id: "cloth", t: "服・くつ", c: "被服及び履物" },
    { id: "phone", t: "スマホ・通信", c: "通信" },
    { id: "study", t: "勉強（教材など）", c: "教育" },
  ].map((x) => ({ ...x, r: cpiAt(x.c, Y1) / cpiAt(x.c, Y0) }));
  const ALL = cpiAt("総合", Y1) / cpiAt("総合", Y0);
  const PRE = [
    { t: "おやつ好き", v: { snack: 1500, eat: 700, food: 300, fun: 500 } },
    { t: "あそび中心", v: { snack: 500, eat: 300, fun: 1700, cloth: 500 } },
    { t: "スマホ中心", v: { snack: 600, eat: 400, fun: 500, phone: 1500 } },
  ];
  let v = store.get("miV", null) || { ...PRE[0].v };
  const pct = (r) => (r >= 1 ? "+" : "−") + Math.abs((r - 1) * 100).toFixed(1) + "%";

  box.innerHTML = `<div class="chips mi-pre" id="miPre">${PRE.map((p, i) => `<button type="button" class="chip" data-p="${i}">${p.t}</button>`).join("")}</div>
    <div class="mi-grid"><div class="mi-rows">${CAT.map((x) => `<div class="mi-row"><span class="mi-t">${x.t}<em class="${x.r >= 1 ? "up" : "dn"}">10年で${pct(x.r)}</em></span>
      <span class="mi-q"><button type="button" data-id="${x.id}" data-d="-100" aria-label="${x.t}を100円へらす">−</button><b id="mi-${x.id}"></b><button type="button" data-id="${x.id}" data-d="100" aria-label="${x.t}を100円ふやす">＋</button></span></div>`).join("")}</div>
      <div class="mi-out" id="miOut" aria-live="polite"></div></div>`;

  function render() {
    const tot = CAT.reduce((a, x) => a + (v[x.id] || 0), 0);
    CAT.forEach((x) => { $(`mi-${x.id}`).textContent = yen(v[x.id] || 0) + "円"; });
    const now = PRE.findIndex((p) => CAT.every((x) => (p.v[x.id] || 0) === (v[x.id] || 0)));
    [...$("miPre").children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === now)));
    if (!tot) { $("miOut").innerHTML = `<p class="mi-empty">＋を押して、1か月のおこづかいの使い道を入れてみよう。</p>`; return; }
    // 今の使い方で買っている物を、10年前に買ったらいくらだったか
    const past = CAT.reduce((a, x) => a + (v[x.id] || 0) / x.r, 0), mine = tot / past;
    const top = CAT.filter((x) => v[x.id]).sort((a, b) => b.r - a.r)[0];
    const msg = mine > ALL + 0.01 ? `物価全体（${pct(ALL)}）より大きく値上がりしています。${top ? `いちばん上がったのは「${top.t}」（${pct(top.r)}）。` : ""}おやつや食べ物は、10年でとくに値上がりしました。`
      : mine < ALL - 0.01 ? "物価全体より、値上がりが小さめです。スマホ代や勉強のお金は、10年で下がったからです。" : "物価全体と、ほぼ同じ上がり方です。";
    $("miOut").innerHTML = `<span class="mi-k">1か月 ${yen(tot)}円の使い方だと…</span>
      <div class="mi-bars"><div><small>${Y0}年なら</small><i style="width:${(past / Math.max(past, tot)) * 100}%"></i><b>${yen(past)}円</b></div>
        <div class="now"><small>${Y1}年は</small><i style="width:${(tot / Math.max(past, tot)) * 100}%"></i><b>${yen(tot)}円</b></div></div>
      <p class="mi-big">あなたのおこづかい物価：<b class="${mine >= 1 ? "up" : "dn"}">${pct(mine)}</b><small>（物価全体は ${pct(ALL)}）</small></p>
      <div class="q-say">${D.OK.mascot ? D.OK.mascot(mine > ALL + 0.01 ? "think" : "smile", 40) : ""}<p>${msg}</p></div>`;
  }
  const save = () => { store.set("miV", v); render(); };
  box.addEventListener("click", (e) => {
    const p = e.target.closest("[data-p]"); if (p) { v = { ...PRE[+p.dataset.p].v }; save(); return; }
    const b = e.target.closest("[data-d]"); if (b) { const id = b.dataset.id; v = { ...v, [id]: Math.max(0, Math.min(10000, (v[id] || 0) + +b.dataset.d)) }; save(); }
  });
  render();
})();
