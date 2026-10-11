// おかねの物差し：おすすめコース（順番に読む道案内）・文字の大きさ
(() => {
  const D = window, { $, esc, store } = D.OK;

  // ===== 文字の大きさ =====
  const setSize = (v) => { document.body.classList.toggle("bigtext", v === "big"); [...$("sizeSeg").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v))); store.set("size", v); };
  $("sizeSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setSize(b.dataset.v); });
  setSize(store.get("size", "normal"));

  // ===== おすすめコース =====
  const COURSES = [
    { id: "first", t: "はじめての10分コース", who: "小学生・はじめての人", c: "var(--ruler)", why: "値段を「自分がはたらく時間」ではかる、いちばん大事なところだけ。", steps: ["money", "try", "hours", "map", "rank", "quiz"] },
    { id: "news", t: "ニュースがわかるコース", who: "中学生・高校生", c: "var(--seg1)", why: "物価・円安・国の予算・消費税。ニュースによく出る言葉の意味がわかります。", steps: ["time", "race", "fx", "big", "tax", "words"] },
    { id: "future", t: "将来のお金コース", who: "中学生・高校生・大人", c: "var(--seg6)", why: "はたらいたら給料はいくら？ 何が引かれる？ どうやって貯める？", steps: ["agewage", "pay", "kakei", "save", "diary"] },
    { id: "study", t: "自由研究コース", who: "夏休みの宿題・授業の調べ学習", c: "var(--seg3)", why: "自分の数字を集めて、印刷できるワークシートにまとめます。", steps: ["mycard", "hours", "time", "diary", "sheet"] },
  ];
  const HOME_LABEL = { try: "ためしてみよう（換算機）", mycard: "あなたの物差しカード" };
  const plain = (el) => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent.trim(); };
  function label(id) {
    if (HOME_LABEL[id]) return HOME_LABEL[id];
    const s = $(id); if (!s) return id;
    const n = s.querySelector(".rule-band span");
    return `${n ? n.textContent + " " : ""}${plain(s.querySelector(".ch-head h2"))}`;
  }
  // 短い名前は、上の章メニュー（はたらく時間・日本地図…）の名前を使う
  const SHORT_HOME = { try: "換算機", mycard: "物差しカード" };
  function shortLabel(id) {
    if (SHORT_HOME[id]) return SHORT_HOME[id];
    const a = document.querySelector(`#chapters a[href="#${id}"]`);
    if (!a) return id;
    const c = a.cloneNode(true); c.querySelectorAll(".n").forEach((n) => n.remove());
    return c.textContent.trim();
  }

  // 移動は、ページの切りかえのしくみ（リンクを押したとき）にまかせる
  const navA = document.createElement("a"); navA.hidden = true; document.body.appendChild(navA);
  const nav = (id) => { navA.href = "#" + id; navA.click(); };

  let state = store.get("course", null); // { id, i }
  const seen = () => store.get("courseSeen", {});
  function markSeen(cid, sid) { const s = seen(); s[cid] = Array.from(new Set([...(s[cid] || []), sid])); store.set("courseSeen", s); }

  function renderCards() {
    const s = seen();
    $("courseGrid").innerHTML = COURSES.map((c) => {
      const done = s[c.id] || [], active = state && state.id === c.id;
      return `<div class="course" style="--cc:${c.c}"><div class="ch-k"><span class="ttl">${c.t}</span><span class="who">${c.who}</span></div>
        <p class="why">${c.why}</p>
        <ol>${c.steps.map((st, k) => `<li class="${done.includes(st) ? "done" : ""}">${D.OK.icon ? D.OK.icon(st, 13) : ""}${k + 1}. ${esc(shortLabel(st))}</li>`).join("")}</ol>
        <div class="go"><span class="hint">${c.steps.length}つの章・約${c.steps.length * 2}分${done.length ? `・${done.length}つ読んだ` : ""}</span><button type="button" class="btn${active ? " ghost" : ""}" data-c="${c.id}">${active ? "つづきから" : done.length === c.steps.length ? "もう一度" : "はじめる"}</button></div></div>`;
    }).join("");
    $("courseGrid").querySelectorAll("button[data-c]").forEach((b) => b.addEventListener("click", () => {
      const c = COURSES.find((x) => x.id === b.dataset.c);
      if (!(state && state.id === c.id)) state = { id: c.id, i: 0 };
      store.set("course", state); go();
    }));
  }

  const bar = document.createElement("div"); bar.className = "course-bar"; bar.setAttribute("role", "navigation"); bar.setAttribute("aria-label", "コースの道案内"); bar.hidden = true;
  document.body.appendChild(bar);
  function renderBar() {
    if (!state) { bar.hidden = true; document.body.classList.remove("in-course"); return; }
    const c = COURSES.find((x) => x.id === state.id); if (!c) { state = null; return renderBar(); }
    const i = state.i, last = i === c.steps.length - 1;
    bar.hidden = false; document.body.classList.add("in-course");
    bar.innerHTML = `<div><div class="cb-t">${c.t}　${i + 1} / ${c.steps.length}</div><div class="cb-n">${esc(label(c.steps[i]))}</div><div class="cb-dots">${c.steps.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="cb-b"><button type="button" class="pv" ${i === 0 ? "disabled" : ""}>← 前へ</button><button type="button" class="nx">${last ? "おわり" : "次へ →"}</button><button type="button" class="qt" aria-label="コースをやめる">×</button></div>`;
    bar.querySelector(".pv").addEventListener("click", () => { if (state.i > 0) { state.i--; store.set("course", state); go(); } });
    bar.querySelector(".nx").addEventListener("click", () => {
      if (last) { const name = c.t; state = null; store.set("course", null); renderBar(); renderCards(); nav("courses"); setTimeout(() => { const g = $("courseGrid"); g.insertAdjacentHTML("afterbegin", `<p class="easy" style="grid-column:1/-1"><span class="tag">コースかんりょう</span>「${esc(name)}」を最後まで読みました。おつかれさま！ ほかのコースもためしてみよう。</p>`); }, 50); return; }
      state.i++; store.set("course", state); go();
    });
    bar.querySelector(".qt").addEventListener("click", () => { state = null; store.set("course", null); renderBar(); renderCards(); });
  }
  function go() {
    const c = COURSES.find((x) => x.id === state.id), id = c.steps[state.i];
    markSeen(c.id, id); renderBar(); renderCards(); nav(id);
  }

  renderCards(); renderBar();
})();
