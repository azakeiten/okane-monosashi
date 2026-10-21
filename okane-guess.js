// おかねの物差し：値段あてチャレンジ。本物の値段（東京23区の2025年平均）を、つまみで当てる（5問）
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const box = $("gsBox"); if (!box) return;
  const POOL = D.ITEMS.filter((i) => i.p25 <= 60000);
  const N = 5;
  let qs, qi, total, guess, done;
  const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  // つまみの範囲：本物の値段の1/4〜3倍くらい（ちょうど真ん中が答えにならないよう、少しずらす）
  const range = (p) => { const lo = Math.max(10, Math.round(p * (0.2 + Math.random() * 0.1))), hi = Math.round(p * (2.6 + Math.random() * 0.8)); const st = p >= 10000 ? 500 : p >= 2000 ? 50 : p >= 500 ? 10 : 1; return { lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, st }; };
  function start() { qs = shuffle(POOL.slice()).slice(0, N).map((it) => ({ it, ...range(it.p25) })); qi = 0; total = 0; next(); }
  function next() { const q = qs[qi]; guess = Math.round((q.lo + q.hi) / 2 / q.st) * q.st; done = null; render(); }
  // 点数：ずれが小さいほど高い（ぴったり100点、3分の2ずれたら0点）
  const score = (g, p) => Math.max(0, Math.round(100 - (Math.abs(g - p) / p) * 150));
  function render() {
    if (qi >= N) {
      const best = store.get("guessBest", null), rec = best == null || total > best; if (rec) store.set("guessBest", total);
      box.innerHTML = `<div class="gs-end">${D.OK.mascot ? D.OK.mascot(total >= 350 ? "wow" : "smile", 60) : ""}<div><p class="gs-big">5問で <b>${total}</b>点 / 500点${rec ? '<span class="newrec">新記録！</span>' : ""}</p>
        <p>${total >= 400 ? "値段はかせ！ ふだんから値段をよく見ていますね。" : total >= 250 ? "なかなか！ お店で値段を見るくせをつけると、もっと当たるよ。" : "意外な値段もあったね。今度お店に行ったら、値段を見てみよう。"}</p>
        <button type="button" class="btn" data-a="again">もう一回</button></div></div>`;
      return;
    }
    const q = qs[qi], it = q.it, w = D.OK.wage();
    box.innerHTML = `<div class="gs-top"><span>${qi + 1}問目 / ${N}</span><span class="gs-sc">${total}点</span></div>
      <p class="gs-q"><b>${esc(it.name)}</b><small>（${esc(it.unit)}）</small>は、いくら？</p>
      <div class="gs-val"><b id="gsV">${yen(guess)}</b>円</div>
      <input type="range" id="gsIn" min="${q.lo}" max="${q.hi}" step="${q.st}" value="${guess}" aria-label="予想の値段"${done ? " disabled" : ""}>
      <div class="gs-ends"><span>${yen(q.lo)}円</span><span>${yen(q.hi)}円</span></div>
      ${done ? `<div class="gs-res"><div class="gs-bar"><i class="you" style="left:${((guess - q.lo) / (q.hi - q.lo)) * 100}%"><span>あなた</span></i><i class="ans" style="left:${((it.p25 - q.lo) / (q.hi - q.lo)) * 100}%"><span>本物 ${yen(it.p25)}円</span></i></div>
        <div class="q-say">${D.OK.mascot ? D.OK.mascot(done.s >= 70 ? "wow" : "think", 40) : ""}<p><b>${done.s}点！</b> 本物は<b>${yen(it.p25)}円</b>（東京23区の2025年平均）。${done.s >= 90 ? "ほぼぴったり！" : done.s >= 60 ? "おしい！" : guess > it.p25 ? "思ったより安かったね。" : "思ったより高かったね。"} 時給${yen(w)}円だと、はたらく時間は<b>${hmText(it.p25 / w)}</b>です。</p></div>
        <button type="button" class="btn" data-a="next">${qi < N - 1 ? "次の問題" : "けっかを見る"}</button></div>` : `<button type="button" class="btn" data-a="ok">これに決めた！</button>`}`;
    if (!done) $("gsIn").addEventListener("input", (e) => { guess = +e.target.value; $("gsV").textContent = yen(guess); });
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a;
    if (a === "ok") { const s = score(guess, qs[qi].it.p25); total += s; done = { s }; render(); }
    else if (a === "next") { qi++; if (qi < N) next(); else render(); }
    else if (a === "again") start();
  });
  start();
})();
