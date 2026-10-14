// おかねの物差し：読み上げ。「この章のポイント」と「なぜなに相談室」の答えを、声で読む
(() => {
  const D = window;
  if (!("speechSynthesis" in D) || !("SpeechSynthesisUtterance" in D)) return;
  const syn = D.speechSynthesis;
  const ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
  let voice = null;
  const pickVoice = () => { const v = syn.getVoices().filter((x) => /^ja/i.test(x.lang)); voice = v.find((x) => /Kyoko|Nanami|Haruka|Google/i.test(x.name)) || v[0] || null; };
  pickVoice(); if ("onvoiceschanged" in syn) syn.addEventListener("voiceschanged", pickVoice);

  // ふりがな（rt）とリンクは読まない
  const plain = (el) => { const c = el.cloneNode(true); c.querySelectorAll("rt, .say-btn, a, svg").forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); };
  let cur = null;
  const reset = () => { if (cur) { cur.setAttribute("aria-pressed", "false"); cur.querySelector("span").textContent = "よみあげ"; } cur = null; };
  function speak(btn, el) {
    const same = cur === btn; syn.cancel(); reset(); if (same) return;
    const u = new SpeechSynthesisUtterance(plain(el)); u.lang = "ja-JP"; u.rate = 0.95; if (voice) u.voice = voice;
    u.onend = u.onerror = () => { if (cur === btn) reset(); };
    cur = btn; btn.setAttribute("aria-pressed", "true"); btn.querySelector("span").textContent = "とめる";
    syn.speak(u);
  }
  const add = (host, target) => {
    if (host.querySelector(".say-btn")) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "say-btn"; b.setAttribute("aria-pressed", "false");
    b.innerHTML = `${ICON}<span>よみあげ</span>`; b.setAttribute("aria-label", "声で読み上げる");
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); speak(b, target()); });
    host.appendChild(b);
  };
  document.querySelectorAll(".takeaway .tk-b").forEach((h) => add(h, () => h.querySelector("p")));
  document.querySelectorAll(".fq-bub").forEach((h) => add(h, () => h));
  document.querySelectorAll(".hl-card").forEach((h) => add(h, () => h));
  // ほかの画面に移ったら止める
  addEventListener("hashchange", () => { syn.cancel(); reset(); });
  addEventListener("pagehide", () => syn.cancel());
})();
