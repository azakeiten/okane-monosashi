// おかねの物差し：大人になったら、給料はどう変わる？・読んでいる位置のバー
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const A = D.AGEWAGE, N = A.ages.length;
  const ONI = D.ITEMS.find((i) => i.id === "onigiri").p25;
  const short = (s) => s.replace("歳", "");

  // ===== 10 年れいと給料 =====
  const ageIn = $("awAge");
  ageIn.value = store.get("awAge", 1);
  let show = store.get("awShow", "all");
  ageIn.addEventListener("input", () => { store.set("awAge", +ageIn.value); render(); });
  $("awShow").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; show = b.dataset.v; store.set("awShow", show); render(); });

  function render() {
    const i = +ageIn.value, m = A.all[i] * 1000, w = D.OK.wage();
    [...$("awShow").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === show)));
    $("awAgeL").textContent = A.ages[i];
    $("awLabel").textContent = `${A.ages[i]}の人の、1か月の給料（平均）`;
    $("awValue").innerHTML = `${yen(m)}<span class="u">円</span>`;
    const base = A.all[1];
    $("awSub").innerHTML = i === 1 ? `ここを1として、ほかの年れいとくらべます。` : `20〜24歳（${yen(base * 1000)}円）の<b>${(A.all[i] / base).toFixed(2)}倍</b>です。`;
    const net = D.OK.calcPay(m, 2).net;
    $("awGrid").innerHTML = [
      { k: "手取り（目安）", v: `約${yen(Math.round(net / 1000) * 1000)}円`, s: "税金・保険料を引いたあと" },
      { k: "おにぎりにすると", v: `${yen(m / ONI)}個`, s: `1個${ONI}円で` },
      { k: "あなたの時給だと", v: hmText(m / w).replace(/約(\d+)時間\d+分/, "約$1時間"), s: `時給${yen(w)}円で何時間ぶんか` },
      { k: "男女べつ", v: `${yen(A.men[i] * 1000)}円／${yen(A.women[i] * 1000)}円`, s: "男性／女性の平均" },
    ].map((c) => `<div><span class="k">${c.k}</span><span class="v">${esc(c.v)}</span><span class="s">${esc(c.s)}</span></div>`).join("");
    draw(i);
  }
  function draw(sel) {
    const xs = A.ages.map((_, i) => i);
    const series = [{ v: A.all, c: "var(--cool)", label: "男女あわせて", end: `${A.all[N - 1]}`, dy: 14 }];
    if (show === "split") {
      series.push({ v: A.men, c: "var(--seg5)", label: "男性", end: `${A.men[N - 1]}`, dy: -14 });
      series.push({ v: A.women, c: "var(--seg6)", label: "女性", end: `${A.women[N - 1]}`, dy: 14 });
    }
    $("awLegend").innerHTML = series.map((s) => `<span style="--c:${s.c}">${s.label}</span>`).join("");
    D.OK.lineChart($("awChart"), {
      W: 760, H: 300, M: { l: 46, r: 110, t: 20, b: 30 }, xs, yMin: 150, yMax: 500, yTicks: [200, 300, 400, 500],
      series, xTicks: () => true, fmtX: (i) => short(A.ages[i]), tip: $("awTip"),
      marks: [(X) => `<line x1="${X(sel)}" x2="${X(sel)}" y1="20" y2="270" stroke="var(--ruler)" stroke-width="3" opacity=".8"/>`],
      onHover: (i) => `<b>${A.ages[i]}</b><br>男女あわせて <b>${yen(A.all[i] * 1000)}円</b>` + (show === "split" ? `<br>男性 <b>${yen(A.men[i] * 1000)}円</b><br>女性 <b>${yen(A.women[i] * 1000)}円</b>` : ""),
    });
    const pk = A.all.indexOf(Math.max(...A.all));
    $("awText").innerHTML = `いちばん多いのは<b>${A.ages[pk]}の${yen(A.all[pk] * 1000)}円</b>で、20〜24歳の約${(A.all[pk] / A.all[1]).toFixed(1)}倍。60歳をすぎると下がり、60〜64歳は${yen(A.all[9] * 1000)}円です。単位は千円（グラフのたての数字）。`;
  }
  D.OK.onUnit(render);
  render();

  // ===== 読んでいる位置のバー（上のバーの下に、黄色い物差しの線） =====
  const bar = document.createElement("div"); bar.className = "readbar"; bar.setAttribute("aria-hidden", "true");
  document.querySelector(".top").appendChild(bar);
  let ticking = false;
  const update = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; ticking = false; };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update); update();
  // 画面を切りかえたあとも正しく出るように
  document.addEventListener("click", () => setTimeout(update, 60));
})();
