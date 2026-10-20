// おかねの物差し：日本に住む人を100人にすると？（年れい3区分の100マス・10年間の人口の変化）
(() => {
  const D = window, { $, yen } = D.OK;
  const box = $("popBox"); const A = D.POP_AGE, T = D.POP_TREND; if (!box || !A || !T) return;
  const G = [
    { k: "kids", t: "子ども（15歳未満）", v: A.kids, c: "var(--ruler)" },
    { k: "work", t: "はたらく世代（15〜64歳）", v: A.work, c: "var(--cool)" },
    { k: "old", t: "お年より（65歳以上）", v: A.old, c: "var(--hot)" },
  ];
  // 100人にしたときの人数（合計がちょうど100になるよう、端数の大きい順に足す）
  const raw = G.map((g) => (g.v / A.total) * 100), n = raw.map(Math.floor);
  let rest = 100 - n.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { n[i]++; rest--; } });
  const person = (c) => `<svg viewBox="0 0 20 24" aria-hidden="true"><circle cx="10" cy="6" r="4.5" fill="${c}"/><path d="M2.5 23c0-5 3.4-9 7.5-9s7.5 4 7.5 9z" fill="${c}"/></svg>`;
  const last = T.v[T.v.length - 1], first = T.v[0], Y1 = T.from + T.v.length - 1, drop = first - last;
  const per = (A.work / A.old).toFixed(1);
  // 10年間の人口の棒（少しずつへっていく）
  const W = 520, H = 160, L = 8, R = 8, top = 24, base = 120, lo = 12100, hi = 12750, bw = (W - L - R) / T.v.length;
  const yy = (v) => base - ((v / 1e4 - lo) / (hi - lo)) * (base - top);
  let bars = T.v.map((v, i) => `<rect x="${L + i * bw + 3}" y="${yy(v)}" width="${bw - 6}" height="${base - yy(v)}" rx="3" class="pp-b${i === T.v.length - 1 ? " last" : ""}"><title>${T.from + i}年 ${yen(v / 1e4)}万人</title></rect>`).join("");
  bars += `<text x="${L + bw / 2}" y="${yy(first) - 6}" text-anchor="middle" class="pp-l">${(first / 1e8).toFixed(2)}億</text><text x="${L + (T.v.length - 0.5) * bw}" y="${yy(last) - 6}" text-anchor="middle" class="pp-l">${(last / 1e8).toFixed(2)}億</text>`;
  bars += `<text x="${L + bw / 2}" y="${H - 18}" text-anchor="middle" class="pp-a">${T.from}</text><text x="${L + (T.v.length - 0.5) * bw}" y="${H - 18}" text-anchor="middle" class="pp-a">${Y1}</text><text x="${W / 2}" y="${H - 2}" text-anchor="middle" class="pp-a">（目もりは1億2100万人から。とちゅうを省いています）</text>`;

  box.innerHTML = `<div class="pp-grid">
    <div class="pp-card"><div class="pp-people" role="img" aria-label="100人のうち、子ども${n[0]}人、はたらく世代${n[1]}人、お年より${n[2]}人">${G.map((g, i) => person(g.c).repeat(n[i])).join("")}</div>
      <ul class="pp-leg">${G.map((g, i) => `<li style="--c:${g.c}"><span class="sw"></span>${g.t}<b>${n[i]}人</b><small>${yen(g.v)}万人</small></li>`).join("")}</ul></div>
    <div class="pp-side"><div class="pp-fact"><b>${per}人</b><span>はたらく世代${per}人で、お年より1人をささえている計算です。年金や医療のお金（社会保障）が国の予算でいちばん多いのは、このためです。</span></div>
      <div class="pp-card"><span class="pp-k">日本の人口の10年（各年10月1日）</span><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${T.from}年から${Y1}年の総人口">${bars}</svg>
        <p class="pp-t">${T.from}年から${Y1}年までに、約<b>${yen(drop / 1e4)}万人</b>へりました。1年に約${yen(drop / (T.v.length - 1) / 1e4)}万人ずつ、へっている計算です。</p></div></div></div>`;
})();
