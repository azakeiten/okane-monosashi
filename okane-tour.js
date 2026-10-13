// おかねの物差し：はじめての人への道案内ツアー（3ステップ）。最初に開いたときだけ自動で出る
(() => {
  const D = window, { $, store } = D.OK;
  const STEPS = [
    { sel: ".converter", t: "1. 値段を入れてみよう", d: "ここに値段を入れると、「はたらく時間」「おこづかい何か月」「おにぎり何個」に直ります。ためしに数字を変えてみてください。" },
    { sel: ".tabbar", t: "2. 画面を切りかえる", d: "ホームと、4つのパート（くらべる・さかのぼる・しくみ・たしかめる）を切りかえます。スマホでは画面の下、パソコンでは上にあります。" },
    { sel: "#courses", t: "3. 迷ったらコースから", d: "どこから読めばいいか迷ったら、おすすめコースを選ぶと、順番に案内します。はじめてなら「はじめての10分コース」がおすすめです。" },
  ];
  const veil = document.createElement("div"); veil.className = "tour-veil"; veil.hidden = true;
  const ring = document.createElement("div"); ring.className = "tour-ring"; ring.hidden = true;
  const tip = document.createElement("div"); tip.className = "tour-tip"; tip.hidden = true;
  tip.setAttribute("role", "dialog"); tip.setAttribute("aria-modal", "false"); tip.setAttribute("aria-labelledby", "tourTitle");
  document.body.append(veil, ring, tip);
  let i = 0, open = false;

  function place() {
    const s = STEPS[i], el = document.querySelector(s.sel); if (!el) return;
    // スマホでは下にタブバーがあるので、その上までを「見える場所」とする
    const bar = document.querySelector(".tabbar"), isBar = s.sel.includes("tabbar");
    const br = bar && !isBar ? bar.getBoundingClientRect() : null;
    const bottomLimit = br && br.top > innerHeight / 2 ? br.top - 8 : innerHeight - 8, pad = 8;
    const r = el.getBoundingClientRect(), top = Math.max(r.top, 8), bot = Math.min(r.bottom, bottomLimit);
    Object.assign(ring.style, { left: r.left - pad + "px", top: top - pad + "px", width: r.width + pad * 2 + "px", height: Math.max(0, bot - top) + pad * 2 + "px" });
    const tw = Math.min(360, innerWidth - 24), th = tip.offsetHeight;
    tip.style.width = tw + "px"; tip.style.left = Math.min(Math.max(12, r.left), innerWidth - tw - 12) + "px";
    // 下に入れば下、だめなら上、どちらも足りなければ画面の下のほうに重ねる
    let y;
    if (bot + pad + 12 + th <= bottomLimit) y = bot + pad + 12;
    else if (top - pad - 12 - th >= 8) y = top - pad - 12 - th;
    else y = bottomLimit - th - 4;
    tip.style.top = y + "px";
  }
  function show() {
    const s = STEPS[i], el = document.querySelector(s.sel);
    if (el && !s.sel.includes("tabbar")) {
      const tall = el.offsetHeight > innerHeight * 0.55;
      el.scrollIntoView({ block: tall ? "start" : "center", behavior: "instant" });
      // 上の見出しバーに隠れないように、少し下げる
      const hd = document.querySelector("header");
      if (tall && hd) scrollBy({ top: -(hd.getBoundingClientRect().bottom + 16), behavior: "instant" });
    }
    tip.innerHTML = `<div class="tt-k">${D.OK.mascot(i === STEPS.length - 1 ? "wow" : "smile", 34)}使い方 ${i + 1} / ${STEPS.length}</div><b id="tourTitle">${s.t}</b><p>${s.d}</p>
      <div class="tt-b"><button type="button" class="btn ghost" data-a="skip">とじる</button><button type="button" class="btn" data-a="next">${i === STEPS.length - 1 ? "はじめる" : "次へ"}</button></div>`;
    veil.hidden = ring.hidden = tip.hidden = false;
    requestAnimationFrame(() => { place(); tip.querySelector('[data-a="next"]').focus(); });
  }
  function start() {
    // ホームの画面で案内する
    const a = document.createElement("a"); a.href = "#home"; a.hidden = true; document.body.appendChild(a); a.click(); a.remove();
    i = 0; open = true; setTimeout(show, 80);
  }
  function close() { open = false; veil.hidden = ring.hidden = tip.hidden = true; store.set("toured", true); }
  tip.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "skip") return close();
    if (i < STEPS.length - 1) { i++; show(); } else close();
  });
  veil.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (open && e.key === "Escape") close(); });
  addEventListener("resize", () => { if (open) place(); });
  addEventListener("scroll", () => { if (open) place(); }, { passive: true });

  // ホームの「使い方を見る」ボタン
  const btn = $("tourBtn"); if (btn) btn.addEventListener("click", start);
  // はじめて開いたとき（そして、ほかの章へのリンクから来たのではないとき）だけ自動で出す
  const h = location.hash.slice(1);
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (!framed && !store.get("toured", false) && (!h || h === "home")) setTimeout(start, 600);
})();
