// おかねの物差し：ホームの「ものさしくんの今日の1問」。日にちごとに1問、何日つづけて答えたかを数える
(() => {
  const D = window, { $, esc, store } = D.OK;
  const box = $("dailyBox"); const Q = D.OK.ideas; if (!box || !Q || !Q.length) return;
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = ymd(new Date()), yest = ymd(new Date(Date.now() - 864e5));
  // 日にちから毎日ちがう問題と、選択肢のならびを決める（同じ日はだれが開いても同じ）
  const seed = [...today].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const q = Q[seed % Q.length];
  let r = seed; const rnd = () => (r = (r * 1103515245 + 12345) >>> 0) / 4294967296;
  const opts = q.o.map((t, i) => ({ t, ok: i === 0 })).sort(() => rnd() - 0.5);
  const L = ["A", "B", "C"];

  function render() {
    const rec = store.get("daily", { last: null, streak: 0, ans: null });
    const done = rec.last === today, streak = rec.last === today || rec.last === yest ? rec.streak : 0;
    const d = new Date();
    box.innerHTML = `<div class="dq-head"><span class="dq-m">${D.OK.mascot ? D.OK.mascot(done ? (rec.ans === "ok" ? "wow" : "think") : "smile", 48) : ""}</span>
        <div><span class="dq-k">ものさしくんの 今日の1問</span><span class="dq-d">${d.getMonth() + 1}月${d.getDate()}日</span></div>
        <span class="dq-st" title="つづけて答えた日数">${D.OK.icon ? D.OK.icon("stamps", 14) : ""}<b>${streak}</b>日れんぞく</span></div>
      <p class="dq-q">${esc(q.q)}</p>
      <div class="dq-opts">${opts.map((o, i) => `<button type="button" data-i="${i}" class="dq-o${done ? (o.ok ? " win" : rec.pick === i ? " lose" : "") : ""}"${done ? " disabled" : ""}><span>${L[i]}</span>${esc(o.t)}</button>`).join("")}</div>
      ${done ? `<p class="dq-why"><b>${rec.ans === "ok" ? "正解！" : "ざんねん！"}</b> ${esc(q.why)} ${q.ch && $(q.ch) ? `<a href="#${q.ch}">→ くわしく</a>` : ""}<br><small>また明日、新しい問題が出ます。</small></p>` : ""}`;
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".dq-o"); if (!b || b.disabled) return;
    const rec = store.get("daily", { last: null, streak: 0 }); if (rec.last === today) return;
    const i = +b.dataset.i, ok = opts[i].ok;
    store.set("daily", { last: today, streak: rec.last === yest ? rec.streak + 1 : 1, ans: ok ? "ok" : "ng", pick: i });
    render();
  });
  render();
})();
