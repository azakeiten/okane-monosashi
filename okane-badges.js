// おかねの物差し：チャレンジバッジ。読むだけでなく「やってみた」ことで、もらえるバッジ
(() => {
  const D = window, { $, store, icon } = D.OK;
  const box = $("badgeGrid"); if (!box) return;
  const B = [
    { id: "first", ic: "hours", t: "はじめの一歩", d: "ホームで、値段を入れてみた", go: "home" },
    { id: "map", ic: "map", t: "地図たんけん", d: "日本地図で、都道府県を選んだ", go: "map" },
    { id: "detective", ic: "race", t: "値上がりたんてい", d: "10年前より、はたらく時間が長くなる買い物かごを見つけた", go: "race" },
    { id: "journey", ic: "tax", t: "1,100円の旅人", d: "お金のめぐり図で、1,100円の旅を最後まで見た", go: "tax" },
    { id: "perfect", ic: "quiz", t: "クイズ名人", d: "どれかのクイズで、5問ぜんぶ正解した", go: "quiz" },
    { id: "allmodes", ic: "words", t: "全モード制覇", d: "クイズを、5つのモードぜんぶで遊んだ", go: "quiz" },
    { id: "card", ic: "save", t: "わたしの物差し", d: "物差しカードを、画像か文章で保存した", go: "mycard" },
    { id: "course", ic: "sheet", t: "コース完走", d: "おすすめコースを、1つ最後まで進んだ", go: "courses" },
    { id: "hakase", ic: "stamps", t: "物差しはかせ", d: "スタンプを、ぜんぶあつめた", go: "stamps" },
  ];
  let got = new Set(store.get("badges", []));

  // バッジをもらったときのお知らせ
  const toast = document.createElement("div"); toast.className = "badge-toast"; toast.setAttribute("role", "status"); toast.hidden = true;
  document.body.appendChild(toast);
  let tt;
  function give(id) {
    if (got.has(id)) return;
    const b = B.find((x) => x.id === id); if (!b) return;
    got.add(id); store.set("badges", [...got]); render(id);
    toast.innerHTML = `<span class="bt-ic">${icon(b.ic, 22)}</span><span><small>バッジをゲット！</small><b>${b.t}</b></span>`;
    toast.hidden = false; toast.classList.remove("show"); void toast.offsetWidth; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => { toast.hidden = true; }, 3600);
  }
  D.OK.badge = give;

  function render(popId) {
    box.innerHTML = B.map((b) => { const on = got.has(b.id);
      return `<a class="badge${on ? " on" : ""}${popId === b.id ? " pop" : ""}" href="#${b.go}"><span class="bd-medal">${icon(b.ic, 30)}</span>
        <span class="bd-t">${on ? b.t : "？？？"}</span><span class="bd-d">${b.d}</span></a>`; }).join("");
    $("badgeCount").textContent = `${got.size} / ${B.length}`;
  }
  render();

  // 「やってみた」の見つけ方。ほかのプログラムには手を入れず、画面の変化を見て判断する
  const later = (fn) => setTimeout(fn, 60);
  $("heroPrice").addEventListener("input", () => give("first"));
  $("heroChips").addEventListener("click", (e) => { if (e.target.closest("button")) give("first"); });
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("#mapSvg .tile, #mapRank button")) give("map");
    if (t.closest("#basket")) later(() => { if (document.querySelector("#bkResult .bk-sum.hard")) give("detective"); });
    if (t.closest("#flowBox")) later(() => { if (/6 \/ 6/.test($("flowK").textContent)) give("journey"); });
    if (t.closest("#quizBox")) later(() => {
      const q = document.querySelector("#quizBox .quiz-q");
      if (q && /5問中 5問/.test(q.textContent)) give("perfect");
      if (Object.keys(store.get("quizBest", {})).length >= 5) give("allmodes");
    });
    if (t.closest("#mcSave, #mcCopy, #mcShare")) give("card");
    const nx = t.closest(".nx"); if (nx && nx.textContent.trim() === "おわり") give("course");
  }, true);
  const stampsDone = () => { const all = document.querySelectorAll("#stampGrid .stamp").length; if (all && document.querySelectorAll("#stampGrid .stamp.got").length === all) give("hakase"); };
  document.addEventListener("okane:stamp", stampsDone); stampsDone();
  if (Object.keys(store.get("quizBest", {})).length >= 5) give("allmodes");
})();
