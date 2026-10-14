// おかねの物差し：ホームの「あたらしくなったこと」。前に来たときにはなかったものに NEW をつける
(() => {
  const D = window, { $, store, esc, icon } = D.OK;
  const box = $("newsRow"); if (!box) return;
  // 新しい順。d は「YYYY-MM-DD」
  const NEWS = [
    { d: "2026-10-14", ic: "quiz", t: "みんなでクイズ", p: "教室の大きな画面に、1問ずつ大きく出せます。キーボードでも進められます。", go: "quiz" },
    { d: "2026-10-14", ic: "sheet", t: "ワークシートが8問に", p: "国の家計簿と、一生のお金すごろくの問題がふえました。印刷できます。", go: "sheet" },
    { d: "2026-10-14", ic: "quiz", t: "しくみクイズが20問に", p: "お金の歴史や国の予算の問題がふえました。", go: "quiz" },
    { d: "2026-10-14", ic: "big", t: "国の1年のお金を1万円に", p: "使い道と、入ってくるお金を100マスで。約4分の1は借金です。", go: "big" },
    { d: "2026-10-14", ic: "sources", t: "さがす・もくじがパワーアップ", p: "ゲームや相談室、歴史も「さがす」で見つかります。もくじに体験のタグも。", go: "toc" },
    { d: "2026-10-14", ic: "agewage", t: "一生のお金すごろく", p: "学校にかかるお金と、65歳まではたらいてもらう給料をならべよう。", go: "agewage" },
    { d: "2026-10-14", ic: "money", t: "お金の歴史", p: "貝がら・小判・お札・スマホ。お金はどう変わってきた？", go: "money" },
    { d: "2026-10-14", ic: "words", t: "よみあげボタン", p: "章のポイントや相談室の答えを、声で読み上げます。", go: "quiz" },
    { d: "2026-10-14", ic: "pay", t: "お店やさんゲーム", p: "ジュース屋さんを5日間。天気を見て、値段と作る数を決めよう。", go: "time" },
    { d: "2026-10-14", ic: "words", t: "なぜなに相談室", p: "「お金を刷ればお金持ち？」など、8つの疑問にものさしくんが答えます。", go: "words" },
    { d: "2026-10-14", ic: "mascot", t: "ものさしくん登場", p: "サイトの案内役。章のポイントやクイズで話しかけてきます。", go: "quiz" },
    { d: "2026-10-13", ic: "time", t: "値段の決まり方", p: "需要と供給のグラフを、つまみで動かしてみよう。", go: "time" },
    { d: "2026-10-12", ic: "stamps", t: "チャレンジバッジ", p: "やってみたことで、10このバッジがもらえます。", go: "stamps" },
    { d: "2026-10-12", ic: "quiz", t: "しくみクイズ", p: "税金・円安・給料のしくみを、5問で確かめよう。", go: "quiz" },
    { d: "2026-10-12", ic: "tax", t: "お金のめぐり図", p: "払った1,100円が、会社・国・家計をめぐる旅。", go: "tax" },
    { d: "2026-10-12", ic: "race", t: "買い物かご", p: "同じかごを買うのに、10年前と今で何分はたらく？", go: "race" },
  ];
  // 見たことのあるお知らせ（題名）を覚えておく。前の版の「最後に見た日付」も読みかえる
  const old = store.get("newsSeen", null);
  let seen = store.get("newsSeenIds", null);
  const V33 = ["みんなでクイズ", "ワークシートが8問に", "しくみクイズが20問に", "国の1年のお金を1万円に", "さがす・もくじがパワーアップ", "一生のお金すごろく", "お金の歴史", "よみあげボタン"]; // 日付だけで覚えていた版（v32）のあとに足したもの
  if (!seen && old) seen = NEWS.filter((n) => n.d <= old && !V33.includes(n.t)).map((n) => n.t);
  const visited = !!seen; seen = new Set(seen || []);
  const fresh = (n) => visited && !seen.has(n.t);
  const fmt = (d) => { const [, m, dd] = d.split("-").map(Number); return `${m}月${dd}日`; };
  box.innerHTML = NEWS.map((n) => { const isNew = fresh(n);
    return `<a class="nw-card${isNew ? " new" : ""}" href="#${n.go}"><span class="nw-top"><span class="nw-ic">${n.ic === "mascot" ? D.OK.mascot("smile", 30) : icon(n.ic, 20)}</span><span class="nw-d">${fmt(n.d)}</span>${isNew ? '<span class="nw-new">NEW</span>' : ""}</span>
      <b>${esc(n.t)}</b><span class="nw-p">${esc(n.p)}</span></a>`; }).join("");
  const cnt = NEWS.filter(fresh).length;
  $("newsCount").textContent = cnt ? `前に来たときから ${cnt}こ ふえました` : "";
  store.set("newsSeenIds", NEWS.map((n) => n.t));
})();
