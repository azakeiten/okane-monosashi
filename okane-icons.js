// おかねの物差し：章ごとのアイコン（線の絵。色は文字の色にしたがう）
(() => {
  const D = window;
  const P = {
    money: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4"/>',
    hours: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    map: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    rank: '<path d="M4 17l6-6 4 4 6-6"/><path d="M14 9h6v6"/>',
    time: '<path d="M7 3h10M7 21h10"/><path d="M8 3c0 6 8 6 8 9s-8 3-8 9M16 3c0 6-8 6-8 9s8 3 8 9"/>',
    race: '<path d="M3 20h18"/><path d="M6 20v-6M11 20V9M16 20v-9M20 20V5"/>',
    save: '<path d="M5 12a7 6 0 0 1 13-2h2v4h-2a7 6 0 0 1-3 3v3h-3v-2h-3v2H6v-3a6 6 0 0 1-1-5z"/><path d="M10 7h4"/><circle cx="15" cy="11" r=".6" fill="currentColor"/>',
    fx: '<circle cx="12" cy="12" r="9"/><path d="M15 9.2a3 3 0 0 0-2.6-1.7h-.9a2.3 2.3 0 0 0 0 4.6h1a2.3 2.3 0 0 1 0 4.6h-.9A3 3 0 0 1 9 15M12 5.5v2M12 16.5v2"/>',
    kakei: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    pay: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3M9 10h6M9 14h6M9 18h3"/>',
    agewage: '<path d="M3 20h5v-4h5v-4h5V8h3"/><path d="M17 4h4v4"/>',
    big: '<path d="M3 21h18M4 10h16M12 3l9 5H3z"/><path d="M6.5 10v8M10.5 10v8M13.5 10v8M17.5 10v8"/>',
    tax: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    diary: '<path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2z"/><path d="M5 20a2 2 0 0 0 2 1h11v-3M9 7h5"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.4"/><circle cx="12" cy="16.8" r=".7" fill="currentColor"/>',
    words: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
    sheet: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 11l2 2 4-4M9 17h6"/>',
    stamps: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z"/>',
    sources: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  };
  D.OK.icon = (id, size = 22) => P[id] ? `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[id]}</svg>` : "";

  // 章の見出し（QUESTION ○○ の左）に、アイコンをつける
  document.querySelectorAll("section.ch").forEach((s) => {
    const q = s.querySelector(".ch-head .q"); if (!q || !P[s.id]) return;
    q.insertAdjacentHTML("afterbegin", `<span class="ch-ic">${D.OK.icon(s.id, 18)}</span>`);
  });
})();
