// おかねの物差し：国のお金メーター。ページを開いてからの時間で、国のお金がどれだけ動いたかを数える
(() => {
  const D = window, { $, yen } = D.OK;
  const box = $("meterBox"); const B = D.BUDGET; if (!box || !B) return;
  const YEAR = 365 * 86400, oku = 1e8;
  const get = (list, id) => list.find((x) => x.id === id).v * oku;
  const M = [
    { t: "国が使ったお金", s: "予算ぜんぶ", v: B.total * oku, c: "var(--seg1)" },
    { t: "社会保障に", s: "年金・医療・介護・子育て", v: get(B.out, "social"), c: "var(--seg2)" },
    { t: "借金の利息に", s: "国債の利払費など", v: 130672 * oku, c: "var(--hot)" },
    { t: "新しい借金", s: "公債金", v: get(B.in, "bond"), c: "var(--seg5)" },
  ].map((m) => ({ ...m, ps: m.v / YEAR }));
  const t0 = performance.now(); let lastSec = -1;
  box.innerHTML = `<div class="mt-time"><span>このページを開いてから</span><b id="mtSec">0</b><span>秒</span></div>
    <div class="mt-grid">${M.map((m, i) => `<div class="mt-c" style="--c:${m.c}"><span class="mt-t">${m.t}</span><b class="mt-v" id="mtV${i}">0円</b><span class="mt-s">${m.s}・1秒に約${yen(m.ps / 1e4)}万円</span></div>`).join("")}</div>`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 画面に見えているあいだだけ、数字を動かす（時間はずっと数えている）
  let on = false, raf = 0;
  function tick() {
    raf = 0; if (!on) return;
    const sec = (performance.now() - t0) / 1000;
    if (!reduce || Math.floor(sec) !== lastSec) {
      lastSec = Math.floor(sec);
      $("mtSec").textContent = lastSec.toLocaleString();
      M.forEach((m, i) => { $(`mtV${i}`).textContent = `${yen(m.ps * (reduce ? lastSec : sec))}円`; });
    }
    raf = requestAnimationFrame(tick);
  }
  const run = (v) => { on = v; if (on && !raf) raf = requestAnimationFrame(tick); };
  if ("IntersectionObserver" in D) new IntersectionObserver((es) => run(es[0].isIntersecting)).observe(box); else run(true);
})();
