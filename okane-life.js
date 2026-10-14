// おかねの物差し：人生のお金すごろく。学校にかかるお金と、はたらいてもらう給料を、年れいの順にならべる
(() => {
  const D = window, { $, yen, store } = D.OK;
  const box = $("lifeBox"); if (!box) return;
  const S = Object.fromEntries(D.SCHOOL.map((s) => [s.id, s])), A = D.AGEWAGE;
  const ONI = D.ITEMS.find((i) => i.id === "onigiri").p25;
  // 年れいごとの毎月の給料（千円）。〜19歳は18・19歳に使う
  const bandOf = (age) => age < 20 ? 0 : Math.min(10, 1 + Math.floor((age - 20) / 5));
  const wageAt = (age) => A.all[bandOf(age)];
  const STAGES = [["kg", "幼稚園", 3, 3], ["es", "小学校", 6, 6], ["jh", "中学校", 12, 3], ["hs", "高校", 15, 3]];
  let pick = store.get("lifePick", { kg: "pub", es: "pub", jh: "pub", hs: "pub" }), start = store.get("lifeStart", 22);
  const man = (v) => v >= 1e8 ? `${(v / 1e8).toFixed(2)}億円` : `${Math.round(v / 1e4).toLocaleString()}万円`;

  box.innerHTML = `<div class="lf-ctl">
      ${STAGES.map(([k, t]) => `<div class="lf-sel"><span>${t}</span><div class="seg" data-k="${k}"><button type="button" data-v="pub">公立</button><button type="button" data-v="pri">私立</button></div></div>`).join("")}
      <div class="lf-sel"><span>はたらき始める年れい</span><div class="seg" id="lfStart"><button type="button" data-v="18">18歳</button><button type="button" data-v="22">22歳</button></div></div>
    </div>
    <ol class="lf-board" id="lfBoard"></ol>
    <div class="lf-sum" id="lfSum"></div>`;

  function render() {
    box.querySelectorAll(".seg[data-k]").forEach((g) => [...g.children].forEach((b) => b.setAttribute("aria-pressed", String(pick[g.dataset.k] === b.dataset.v))));
    [...$("lfStart").children].forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === start)));
    const cells = [{ age: 0, t: "生まれる", kind: "start" }];
    let school = 0;
    STAGES.forEach(([k, t, age, y]) => { const s = S[`${k}-${pick[k]}`], v = s.total * y; school += v; cells.push({ age, t: `${t}（${pick[k] === "pub" ? "公立" : "私立"}）`, kind: "cost", v, sub: `1年 ${man(s.total)} × ${y}年` }); });
    if (start === 22) cells.push({ age: 18, t: "大学・専門学校など", kind: "gap", sub: "このサイトのデータには入っていません" });
    let earn = 0; const work = [];
    const marks = [start, 30, 40, 50, 60]; marks.forEach((a, i) => {
      const to = i < marks.length - 1 ? marks[i + 1] : 65; let v = 0;
      for (let x = a; x < to; x++) v += wageAt(x) * 1000 * 12;
      earn += v; work.push({ age: a, t: `${a}〜${to - 1}歳ではたらく`, kind: "earn", v, sub: `毎月 約${Math.round(wageAt(a) * 1000 / 1e4).toLocaleString()}万円から` });
    });
    cells.push(...work, { age: 65, t: "ゴール！", kind: "goal" });
    $("lfBoard").innerHTML = cells.map((c, i) => `<li class="lf-c ${c.kind}"><span class="lf-n">${i + 1}</span><span class="lf-age">${c.age}歳</span><b>${c.t}</b>${c.v ? `<span class="lf-v">${c.kind === "cost" ? "かかる" : "もらう"} ${man(c.v)}</span>` : ""}${c.sub ? `<small>${c.sub}</small>` : ""}</li>`).join("");
    const first = wageAt(start) * 1000;
    $("lfSum").innerHTML = `<div class="lf-tot cost"><span>幼稚園から高校まで、学校にかかるお金</span><b>${man(school)}</b><small>はたらき始めたころの給料（毎月約${Math.round(first / 1e4)}万円）の、約${Math.round(school / first)}か月分</small></div>
      <div class="lf-tot earn"><span>${start}歳から64歳まで、毎月の給料を合計すると</span><b>${man(earn)}</b><small>おにぎり（${ONI}円）にすると、約${Math.round(earn / ONI / 1e4).toLocaleString()}万個</small></div>`;
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".seg button"); if (!b) return;
    const g = b.parentElement;
    if (g.id === "lfStart") { start = +b.dataset.v; store.set("lifeStart", start); }
    else { pick = { ...pick, [g.dataset.k]: b.dataset.v }; store.set("lifePick", pick); }
    render();
  });
  render();
})();
