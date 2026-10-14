// おかねの物差し：お店やさんゲーム。天気を見て、ジュースの値段と作る数を決める（5日間）
(() => {
  const D = window, { $, yen, store } = D.OK;
  const box = $("shopBox"); if (!box) return;
  const COST = 50, DAYS = 5;
  const WX = [
    { t: "暑い日", w: 1.7, ic: "☀︎", c: "var(--hot)" },
    { t: "晴れ", w: 1.3, ic: "☀︎", c: "var(--ruler)" },
    { t: "くもり", w: 1.0, ic: "☁︎", c: "var(--muted)" },
    { t: "雨", w: 0.5, ic: "☂︎", c: "var(--cool)" },
  ];
  let day, total, log, wx, price, make, phase;
  const pickWx = () => { const r = Math.random(); return r < 0.2 ? 0 : r < 0.5 ? 1 : r < 0.8 ? 2 : 3; };
  // お客さんの数：値段が安いほど、天気がよいほどふえる（しくみの模型）
  const demand = (p, w) => Math.max(0, Math.round(60 * w * Math.max(0, 1 - (p - 40) / 260) * (0.9 + Math.random() * 0.2)));

  function start() { day = 1; total = 0; log = []; price = store.get("shopPrice", 150); make = store.get("shopMake", 30); wx = pickWx(); phase = "plan"; render(); }
  const cups = (sold, left) => `<div class="sp-cups" aria-hidden="true">${"<i class=\"s\"></i>".repeat(Math.min(sold, 80))}${"<i class=\"l\"></i>".repeat(Math.min(left, 80))}</div>`;
  const hint = (r) => {
    if (r.lost >= 6 && r.left === 0) return ["wow", `${r.lost}人のお客さんが、買えずに帰ってしまったよ。もっと作るか、値段を少し上げてもよかったかも。`];
    if (r.left >= 8) return ["think", `${r.left}杯が売れ残って、材料代${yen(r.left * COST)}円がむだになったよ。天気を見て、作る数を考えよう。`];
    if (r.price >= 230 && r.sold < 15) return ["think", "値段が高すぎて、お客さんが少なかったみたい。"];
    if (r.price <= 80) return ["think", "安くしすぎると、たくさん売れても、もうけは少なくなるよ。材料代は1杯50円だからね。"];
    return ["smile", "いい感じ！ 売れる数と作る数が、だいたい合っていたね。"];
  };

  function render() {
    const W = WX[wx];
    const head = `<div class="sp-top"><div class="sp-day">${phase === "end" ? "けっか" : `${day}日目 <small>/ ${DAYS}日</small>`}</div><div class="sp-total"><span>今までのもうけ</span><b class="${total < 0 ? "neg" : ""}">${total < 0 ? "−" : ""}${yen(Math.abs(total))}円</b></div></div>`;
    if (phase === "end") {
      const best = store.get("shopBest", null), rec = best == null || total > best;
      if (rec) store.set("shopBest", total);
      if (total >= 10000 && D.OK.badge) D.OK.badge("shop");
      box.innerHTML = `${head}<div class="sp-end"><span class="sp-m">${D.OK.mascot(total > 0 ? "wow" : "think", 64)}</span><div>
        <p class="sp-big">5日間のもうけは <b>${total < 0 ? "−" : ""}${yen(Math.abs(total))}円</b>${rec ? '<span class="newrec">新記録！</span>' : ""}</p>
        <p>${total >= 10000 ? "すごい！ 天気と値段をよく考えた、りっぱな店長です。" : total > 0 ? "黒字（もうけが出た）です。天気が悪い日は作る数をへらすと、もっともうかるよ。" : "赤字（材料代のほうが多い）でした。作りすぎや、安くしすぎに気をつけよう。"}</p>
        <p class="sp-note">ベスト記録：${yen(Math.max(total, best ?? total))}円。1万円をこえると、バッジ「ジュース屋の店長」がもらえます。</p>
        <button type="button" class="btn" id="spAgain">もう一回あそぶ</button></div></div>
        <ol class="sp-log">${log.map((r, i) => `<li><b>${i + 1}日目</b>${WX[r.wx].t}・${r.price}円・${r.make}杯 → ${r.sold}杯売れた <span class="${r.profit < 0 ? "neg" : ""}">${r.profit < 0 ? "−" : "+"}${yen(Math.abs(r.profit))}円</span></li>`).join("")}</ol>`;
      $("spAgain").addEventListener("click", start); return;
    }
    if (phase === "plan") {
      box.innerHTML = `${head}<div class="sp-plan">
        <div class="sp-wx" style="--c:${W.c}"><span class="sp-ic" aria-hidden="true">${W.ic}</span><div><small>${day}日目の天気予報</small><b>${W.t}</b><span>${W.w > 1.2 ? "のどがかわく人が多そう！" : W.w < 0.8 ? "外を歩く人が少なそう…" : "ふつうの日"}</span></div></div>
        <label class="sp-sl"><span>1杯の値段 <b id="spPv">${price}円</b></span><input type="range" id="spP" min="50" max="300" step="10" value="${price}"></label>
        <label class="sp-sl"><span>作る数 <b id="spMv">${make}杯</b><em id="spCost">材料代 ${yen(make * COST)}円</em></span><input type="range" id="spM" min="0" max="100" step="5" value="${make}"></label>
        <button type="button" class="btn" id="spGo">お店をあける</button>
        <p class="sp-note">材料代は1杯${COST}円。売れ残っても、材料代はもどってきません。</p></div>`;
      const P = $("spP"), M = $("spM");
      P.addEventListener("input", () => { price = +P.value; $("spPv").textContent = price + "円"; });
      M.addEventListener("input", () => { make = +M.value; $("spMv").textContent = make + "杯"; $("spCost").textContent = `材料代 ${yen(make * COST)}円`; });
      $("spGo").addEventListener("click", () => {
        store.set("shopPrice", price); store.set("shopMake", make);
        const want = demand(price, W.w), sold = Math.min(want, make);
        const r = { wx, price, make, want, sold, left: make - sold, lost: Math.max(0, want - make), profit: sold * price - make * COST };
        total += r.profit; log.push(r); phase = "result"; render();
      });
      return;
    }
    const r = log[log.length - 1], [mood, msg] = hint(r);
    box.innerHTML = `${head}<div class="sp-res">
      <div class="sp-row"><div><small>来たお客さん</small><b>${r.want}人</b></div><div><small>売れた</small><b>${r.sold}杯</b></div><div><small>売れ残り</small><b>${r.left}杯</b></div><div><small>この日のもうけ</small><b class="${r.profit < 0 ? "neg" : "pos"}">${r.profit < 0 ? "−" : "+"}${yen(Math.abs(r.profit))}円</b></div></div>
      ${cups(r.sold, r.left)}
      <p class="sp-calc">売り上げ ${yen(r.sold * r.price)}円（${r.price}円×${r.sold}杯） − 材料代 ${yen(r.make * COST)}円（${COST}円×${r.make}杯）</p>
      <div class="q-say">${D.OK.mascot(mood, 44)}<p>${msg}</p></div>
      <button type="button" class="btn" id="spNext">${day < DAYS ? "次の日へ" : "けっかを見る"}</button></div>`;
    $("spNext").addEventListener("click", () => { if (day < DAYS) { day++; wx = pickWx(); phase = "plan"; } else phase = "end"; render(); });
  }
  start();
})();
