// おかねの物差し：章の終わりの「おうちの人と話そう」。学んだことを家で話すきっかけ
(() => {
  const D = window, { $, esc } = D.OK;
  const TALK = {
    money: "お金がなかったら、どうやって物を手に入れていたと思う？ おうちの人に「はじめて自分で買った物」を聞いてみよう。",
    hours: "おうちの人が子どものころ、おにぎりやジュースはいくらだったか聞いてみよう。今とくらべると？",
    map: "親せきや友だちが住んでいる県と、くらべてみよう。旅行先で「値段がちがうな」と感じたことはある？",
    rank: "最近「高くなったな」と感じる物は何？ おうちの人にも聞いて、ランキングとくらべてみよう。",
    time: "おうちの人が生まれた年の1,000円は、今いくら？ いっしょにタイムマシンで調べてみよう。",
    race: "おうちの人の「はじめてのアルバイトの時給」を聞いてみよう。今の最低賃金とくらべると？",
    save: "お年玉やおこづかいを、どうやってためている？ 家族の「お金のルール」を話してみよう。",
    fx: "外国から来た物（食べ物やおもちゃ）を、家の中でさがしてみよう。どこの国から来たかな？",
    kakei: "家族のお金の使い道で、いちばん大きいのは何だと思う？ 予想してから、グラフとくらべてみよう。",
    school: "学校に通うのに、どんなお金がかかっているか、おうちの人と話してみよう。",
    pay: "給料から引かれる税金や保険料は、何に使われていると思う？ おうちの人の考えも聞いてみよう。",
    agewage: "おうちの人に、どんな仕事をしているか、仕事のどんなところが楽しいかを聞いてみよう。",
    big: "ニュースで聞いた「○兆円」を、1人あたりに直して、おうちの人に話してみよう。",
    tax: "買い物のレシートを見せてもらって、8%と10%の品物をさがしてみよう。",
    diary: "1週間おこづかい帳をつけて、おうちの人に見せてみよう。思っていたのとちがう使い道はあった？",
    quiz: "クイズを、おうちの人にも出してみよう。何問正解するかな？",
    words: "ことば辞典のことばを1つえらんで、おうちの人に説明してみよう。",
    sheet: "ワークシートの「近くのお店の値段しらべ」を、おうちの人といっしょにやってみよう。",
  };
  const house = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>`;
  Object.entries(TALK).forEach(([id, t]) => {
    const s = $(id), w = s && s.querySelector(".wrap"); if (!w) return;
    const div = document.createElement("div"); div.className = "talk";
    div.innerHTML = `<span class="tk-ic">${house}</span><div><span class="tk-k">おうちの人と話そう</span><p>${esc(t)}</p></div>`;
    const nx = w.querySelector(":scope > .next-ch");
    w.insertBefore(div, nx || null);
  });
})();
