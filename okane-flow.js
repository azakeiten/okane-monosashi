// おかねの物差し：お金のめぐり図（経済の循環）。家計・会社・国のあいだを、お金がどう回るかを順番に見る
(() => {
  const D = window, { $, yen } = D.OK;
  const box = $("flowBox"); if (!box) return;
  const K = D.KAKEI["消費支出"], KY = D.KAKEI_FIRST_YEAR + K.length - 1, T = D.TAXREV;
  const cho = (v) => (v / 1e12).toFixed(1) + "兆円";
  const big = (id) => D.BIG.find((b) => b.id === id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 3つの登場人物
  const NODES = {
    home: { x: 130, y: 336, t: "家計", s: "わたしたちの家", c: "var(--seg1)" },
    firm: { x: 590, y: 336, t: "会社", s: "お店・会社", c: "var(--seg3)" },
    gov: { x: 360, y: 74, t: "国など", s: "国・都道府県・市区町村", c: "var(--good)" },
  };
  // お金の流れ（線の形・ラベルの位置）
  const FLOWS = {
    buy: { d: "M190 372 Q360 446 530 372", from: "home", to: "firm", t: "代金（買い物）", lx: 360, ly: 432 },
    wage: { d: "M530 300 Q360 232 190 300", from: "firm", to: "home", t: "給料", lx: 360, ly: 262 },
    taxH: { d: "M84 290 Q92 130 278 64", from: "home", to: "gov", t: "税金（所得税など）", lx: 96, ly: 168, a: "start" },
    taxF: { d: "M636 290 Q628 130 442 64", from: "firm", to: "gov", t: "税金（法人税・消費税）", lx: 624, ly: 168, a: "end" },
    pubH: { d: "M318 118 Q250 200 196 282", from: "gov", to: "home", t: "学校・道路・年金など", lx: 236, ly: 212, a: "end" },
    pubF: { d: "M402 118 Q470 200 524 282", from: "gov", to: "firm", t: "道路・港・安全など", lx: 484, ly: 212, a: "start" },
  };
  const STEPS = [
    { on: Object.keys(FLOWS), t: "お金は、ぐるぐるめぐっている",
      d: "わたしたちの家（家計）、お店や会社、国や市区町村。お金は、この3つのあいだを回っています。「次へ」で、あなたが払った1,100円の旅を追いかけてみよう。" },
    { on: ["buy"], t: "1. お店で買い物をする",
      d: "あなたがお店で1,100円のノートを買うと、そのお金はお店（会社）の売り上げになります。1,100円の中には、消費税100円が入っています。",
      f: [`${yen(K[K.length - 1] / 10000)}万円`, `1つの家（2人以上）が1年間に使うお金の平均（${KY}年・家計調査）`] },
    { on: ["taxF"], t: "2. お店が税金を納める",
      d: "お店は、あずかった消費税100円を、国などに納めます。会社のもうけには、法人税という税金もかかります。",
      f: [cho(T.consumption), `国に入る消費税（法人税は${cho(T.corporate)}）・${T.note}`] },
    { on: ["wage"], t: "3. はたらく人に給料をはらう",
      d: "お店は、売り上げの中から、品物の仕入れや家賃をはらい、はたらく人に給料をはらいます。お金が、また家計にもどってきました。",
      f: [`${yen(D.MINWAGE_2026.avg)}円`, "最低賃金（全国平均の時給）。これより安い時給で、人をやとってはいけません"] },
    { on: ["taxH"], t: "4. 給料から税金を納める",
      d: "給料をもらった人は、所得税や住民税を納めます。お店で買い物をするたびに、消費税も払います。",
      f: [cho(T.income), `国に入る所得税・${T.note}`] },
    { on: ["pubH", "pubF"], t: "5. 国が、みんなのために使う",
      d: "国や市区町村は、集めたお金で、学校・道路・警察・消防・病院・年金・子育ての手当などをまかないます。税金だけでは足りない分は、国債という借金でおぎなっています。",
      f: [big("budget").short, `国が1年間に使うお金。そのうち社会保障（年金・医療・介護・子育て）は${big("social").short}・${big("budget").note.split("（")[0]}`] },
    { on: ["buy", "wage"], t: "6. そして、また買い物へ",
      d: "給料や年金を受け取った人が、また買い物をします。こうしてお金がめぐることを「経済の循環（じゅんかん）」と言います。どこかで流れが止まると、ほかの所にも影響が出ます。" },
  ];
  let i = 0;

  const arrow = (k) => { const f = FLOWS[k], c = NODES[f.from].c;
    return `<g class="fl" data-k="${k}" style="--c:${c}"><path id="fp-${k}" d="${f.d}" class="fl-p" marker-end="url(#fl-ar-${f.from})"/>
      <text x="${f.lx}" y="${f.ly}" text-anchor="${f.a || "middle"}" class="fl-t">${f.t}</text>
      ${reduce ? "" : [0, 1, 2].map((j) => `<circle r="5" class="fl-dot"><animateMotion dur="2.4s" begin="${j * 0.8}s" repeatCount="indefinite"><mpath href="#fp-${k}"/></animateMotion></circle>`).join("")}</g>`; };
  const node = (k) => { const n = NODES[k], w = k === "gov" ? 196 : 150;
    return `<g class="fn" data-n="${k}" style="--c:${n.c}"><rect x="${n.x - w / 2}" y="${n.y - 34}" width="${w}" height="68" rx="18"/>
      <text x="${n.x}" y="${n.y - 2}" text-anchor="middle" class="fn-t">${n.t}</text><text x="${n.x}" y="${n.y + 20}" text-anchor="middle" class="fn-s">${n.s}</text></g>`; };
  const markers = Object.entries(NODES).map(([k, n]) => `<marker id="fl-ar-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${n.c}"/></marker>`).join("");

  box.innerHTML = `<div class="fl-stage"><svg viewBox="0 0 720 460" role="img" aria-labelledby="flowTitle" class="fl-svg"><defs>${markers}</defs>
      ${Object.keys(FLOWS).map(arrow).join("")}${Object.keys(NODES).map(node).join("")}</svg></div>
    <div class="fl-side"><div class="fl-k" id="flowK"></div><h4 id="flowH"></h4><p id="flowD"></p><div class="fl-fact" id="flowF"></div>
      <div class="fl-nav"><button type="button" class="btn ghost" id="flowPrev">前へ</button><div class="fl-dots" id="flowDots"></div><button type="button" class="btn" id="flowNext">次へ</button></div></div>`;

  function render() {
    const s = STEPS[i], all = i === 0;
    box.querySelectorAll(".fl").forEach((g) => { const on = s.on.includes(g.dataset.k); g.classList.toggle("on", on && !all); g.classList.toggle("dim", !on); g.classList.toggle("all", all); });
    const used = new Set(s.on.flatMap((k) => [FLOWS[k].from, FLOWS[k].to]));
    box.querySelectorAll(".fn").forEach((g) => g.classList.toggle("on", all || used.has(g.dataset.n)));
    $("flowK").textContent = all ? "お金のめぐり図" : `1,100円の旅 ${i} / ${STEPS.length - 1}`;
    $("flowH").textContent = s.t; $("flowD").textContent = s.d;
    $("flowF").innerHTML = s.f ? `<b>${s.f[0]}</b><span>${s.f[1]}</span>` : ""; $("flowF").hidden = !s.f;
    $("flowPrev").disabled = i === 0;
    $("flowNext").textContent = i === 0 ? "旅をはじめる" : i === STEPS.length - 1 ? "最初から" : "次へ";
    $("flowDots").innerHTML = STEPS.map((_, j) => `<button type="button" data-j="${j}" aria-label="${j === 0 ? "全体" : j + "番目"}を見る"${j === i ? ' aria-current="step"' : ""}></button>`).join("");
  }
  $("flowNext").addEventListener("click", () => { i = (i + 1) % STEPS.length; render(); });
  $("flowPrev").addEventListener("click", () => { if (i > 0) { i--; render(); } });
  $("flowDots").addEventListener("click", (e) => { const b = e.target.closest("[data-j]"); if (b) { i = +b.dataset.j; render(); } });
  const STEP_OF = { buy: 1, taxF: 2, wage: 3, taxH: 4, pubH: 5, pubF: 5 };
  box.addEventListener("click", (e) => { const g = e.target.closest(".fl"); if (g) { i = STEP_OF[g.dataset.k]; render(); } });
  render();
})();
