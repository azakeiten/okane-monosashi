// おかねの物差し：ホームの「あたらしくなったこと」。前に来たときより新しいものに NEW をつける
(() => {
  const D = window, { $, store, esc, icon } = D.OK;
  const box = $("newsRow"); if (!box) return;
  // 新しい順。d は「YYYY-MM-DD」
  const NEWS = [
    { d: "2026-10-14", ic: "pay", t: "お店やさんゲーム", p: "ジュース屋さんを5日間。天気を見て、値段と作る数を決めよう。", go: "time" },
    { d: "2026-10-14", ic: "words", t: "なぜなに相談室", p: "「お金を刷ればお金持ち？」など、8つの疑問にものさしくんが答えます。", go: "words" },
    { d: "2026-10-14", ic: "mascot", t: "ものさしくん登場", p: "サイトの案内役。章のポイントやクイズで話しかけてきます。", go: "quiz" },
    { d: "2026-10-13", ic: "time", t: "値段の決まり方", p: "需要と供給のグラフを、つまみで動かしてみよう。", go: "time" },
    { d: "2026-10-12", ic: "stamps", t: "チャレンジバッジ", p: "やってみたことで、10このバッジがもらえます。", go: "stamps" },
    { d: "2026-10-12", ic: "quiz", t: "しくみクイズ", p: "税金・円安・給料のしくみを、5問で確かめよう。", go: "quiz" },
    { d: "2026-10-12", ic: "tax", t: "お金のめぐり図", p: "払った1,100円が、会社・国・家計をめぐる旅。", go: "tax" },
    { d: "2026-10-12", ic: "race", t: "買い物かご", p: "同じかごを買うのに、10年前と今で何分はたらく？", go: "race" },
  ];
  const latest = NEWS[0].d, prev = store.get("newsSeen", null);
  const fmt = (d) => { const [, m, dd] = d.split("-").map(Number); return `${m}月${dd}日`; };
  box.innerHTML = NEWS.map((n) => { const isNew = prev && n.d > prev;
    return `<a class="nw-card${isNew ? " new" : ""}" href="#${n.go}"><span class="nw-top"><span class="nw-ic">${n.ic === "mascot" ? D.OK.mascot("smile", 30) : icon(n.ic, 20)}</span><span class="nw-d">${fmt(n.d)}</span>${isNew ? '<span class="nw-new">NEW</span>' : ""}</span>
      <b>${esc(n.t)}</b><span class="nw-p">${esc(n.p)}</span></a>`; }).join("");
  const cnt = prev ? NEWS.filter((n) => n.d > prev).length : 0;
  $("newsCount").textContent = cnt ? `前に来たときから ${cnt}こ ふえました` : "";
  store.set("newsSeen", latest);
})();
