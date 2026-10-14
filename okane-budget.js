// おかねの物差し：国の1年のお金を1万円にちぢめる（使い道と、入ってくるお金の100マス）
(() => {
  const D = window, { $, yen, esc } = D.OK;
  const box = $("budgetBox"); const B = D.BUDGET; if (!box || !B) return;
  const COL = { social: "var(--seg1)", debt: "var(--hot)", local: "var(--seg2)", defense: "var(--seg6)", works: "var(--seg4)", edu: "var(--good)", other: "var(--muted)",
    "tax-c": "var(--seg1)", "tax-i": "var(--seg2)", "tax-k": "var(--seg6)", "tax-o": "var(--seg5)", misc: "var(--muted)", bond: "var(--hot)" };
  // 1万円にしたときの金額と、100マス（1マス＝100円）。合計がぴったりになるよう、端数の大きい順に1マスずつ足す
  const shrink = (list) => {
    const yenOf = list.map((x) => ({ ...x, y: Math.round((x.v / B.total) * 10000) }));
    const raw = list.map((x) => (x.v / B.total) * 100), cells = raw.map(Math.floor);
    let rest = 100 - cells.reduce((a, b) => a + b, 0);
    raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { cells[i]++; rest--; } });
    return yenOf.map((x, i) => ({ ...x, n: cells[i] }));
  };
  const OUT = shrink(B.out), IN = shrink(B.in);
  const cho = (v) => (v / 10000).toFixed(1) + "兆円";
  let sel = { out: "social", in: "bond" };

  const panel = (key, title, list) => `<div class="bu-p" data-key="${key}">
      <h4>${title}</h4>
      <div class="bu-waffle" role="img" aria-label="${title}の100マス">${list.map((x) => `<i data-id="${x.id}" style="--c:${COL[x.id]}"></i>`.repeat(x.n)).join("")}</div>
      <ul class="bu-leg">${list.map((x) => `<li><button type="button" data-id="${x.id}" style="--c:${COL[x.id]}"><span class="sw"></span><span class="nm">${esc(x.t)}</span><b>${yen(x.y)}円</b></button></li>`).join("")}</ul>
      <div class="bu-d" aria-live="polite"></div></div>`;
  box.innerHTML = `<div class="bu-grid">${panel("out", "使い道（歳出）", OUT)}${panel("in", "入ってくるお金（歳入）", IN)}</div>`;

  function render() {
    [["out", OUT], ["in", IN]].forEach(([k, list]) => {
      const p = box.querySelector(`.bu-p[data-key="${k}"]`), x = list.find((z) => z.id === sel[k]);
      p.querySelectorAll(".bu-waffle i").forEach((c) => c.classList.toggle("on", c.dataset.id === sel[k]));
      p.querySelectorAll(".bu-leg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === sel[k])));
      p.querySelector(".bu-d").innerHTML = `<b style="color:${COL[x.id]}">${esc(x.t)}</b>　1万円のうち <b>${yen(x.y)}円</b>（本当は${cho(x.v)}）<p>${esc(x.d)}</p>`;
    });
  }
  box.addEventListener("click", (e) => {
    const t = e.target.closest("[data-id]"); if (!t) return;
    const k = t.closest(".bu-p").dataset.key; sel = { ...sel, [k]: t.dataset.id }; render();
  });
  render();
})();
