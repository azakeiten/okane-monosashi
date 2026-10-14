// おかねの物差し：お金の歴史年表（物々交換からキャッシュレスまで）
(() => {
  const D = window, { $, esc } = D.OK;
  const box = $("histLine"); if (!box) return;
  const NOW = new Date().getFullYear();
  // 小さな絵（すべてこのサイトで描いたもの）
  const ART = {
    shell: `<path d="M24 36L7 17Q24 -2 41 17Z" fill="color-mix(in srgb, var(--hot) 25%, var(--card))" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><path d="M24 36V5M24 36L14 9M24 36L34 9M24 36L9 14M24 36L39 14" stroke="var(--ink)" stroke-width="1.3" opacity=".7"/><path d="M19 36h10l-2 3h-6z" fill="var(--ink)"/>`,
    hole: `<circle cx="24" cy="20" r="15" fill="color-mix(in srgb, var(--hot) 55%, var(--card))" stroke="var(--ink)" stroke-width="2"/><rect x="19.5" y="15.5" width="9" height="9" fill="var(--card)" stroke="var(--ink)" stroke-width="1.6"/>`,
    koban: `<ellipse cx="24" cy="20" rx="11" ry="16" fill="var(--ruler)" stroke="var(--ink)" stroke-width="2"/><path d="M17 12h14M17 17h14M17 23h14M17 28h14" stroke="var(--ruler-ink)" stroke-width="1.2" opacity=".5"/>`,
    en: `<circle cx="24" cy="20" r="15" fill="color-mix(in srgb, var(--muted) 35%, var(--card))" stroke="var(--ink)" stroke-width="2"/><text x="24" y="26" text-anchor="middle" font-size="16" font-weight="900" fill="var(--ink)">円</text>`,
    bill: `<rect x="4" y="8" width="40" height="24" rx="3" fill="color-mix(in srgb, var(--good) 22%, var(--card))" stroke="var(--ink)" stroke-width="2"/><circle cx="31" cy="20" r="6" fill="none" stroke="var(--ink)" stroke-width="1.6"/><path d="M9 14h12M9 19h9M9 24h12" stroke="var(--ink)" stroke-width="1.4"/>`,
    holo: `<rect x="4" y="8" width="40" height="24" rx="3" fill="color-mix(in srgb, var(--cool) 22%, var(--card))" stroke="var(--ink)" stroke-width="2"/><circle cx="14" cy="20" r="6" fill="url(#hgr)" stroke="var(--ink)" stroke-width="1.4"/><path d="M25 14h14M25 19h10M25 24h14" stroke="var(--ink)" stroke-width="1.4"/>`,
    phone: `<rect x="14" y="3" width="20" height="34" rx="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><rect x="18" y="10" width="12" height="12" fill="none" stroke="var(--ink)" stroke-width="1.4"/><path d="M20 12h3v3h-3zM25 17h3v3h-3z" fill="var(--ink)"/><path d="M21 31h6" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/>`,
  };
  const H = [
    { y: null, era: "大昔", art: "shell", t: "物々交換と、貝のお金", d: "最初は、物と物を直接とりかえていました。やがて、貝がら・布・お米などが「お金」の代わりに使われるようになります。「貨」「財」「買」など、お金に関係する漢字に「貝」が入っているのは、そのなごりです。" },
    { y: 708, era: "飛鳥・奈良時代", art: "hole", t: "日本でも銅のお金が作られる", d: "7世紀の後半には富本銭（ふほんせん）が、708年には和同開珎（わどうかいちん）が作られました。まん中に四角い穴があいているのは、中国のお金をお手本にしたからです。" },
    { y: null, when: "12〜16世紀ごろ", era: "平安〜室町時代", art: "hole", t: "中国から来たお金を使う", d: "日本でお金を作らなくなった時代には、中国から船で運ばれてきた銭（宋銭・明銭）が、日本じゅうで使われていました。" },
    { y: 1601, era: "江戸時代", art: "koban", t: "金の小判・銀・銭の「三貨」", d: "徳川家康のころに、金でできた小判（慶長小判）が作られました。江戸時代は、金貨・銀貨・銅の銭（寛永通宝など）の3種類のお金を使い分けていました。" },
    { y: 1871, era: "明治時代", art: "en", t: "「円」が生まれる", d: "新貨条例という法律で、お金の単位が「円・銭・厘」に決まりました。1円＝100銭＝1,000厘です。今も使っている「円」は、ここから始まりました。" },
    { y: 1885, era: "明治時代", art: "bill", t: "日本銀行のお札が出る", d: "1882年に日本銀行ができ、1885年に最初の日本銀行券（お札）が発行されました。今のお札も、すべて日本銀行が発行しています。" },
    { y: 2024, era: "令和", art: "holo", t: "新しいお札（2024年7月）", d: "1万円札は渋沢栄一、5千円札は津田梅子、千円札は北里柴三郎になりました。かたむけると肖像が回って見える「3Dホログラム」など、にせ札を作りにくくする工夫が入っています。" },
    { y: null, era: "今", art: "phone", t: "キャッシュレスの時代", d: "カードやスマホで払うキャッシュレスがふえています。形は変わっても、とりかえる・はかる・ためるという、お金の3つの役割は同じです。" },
  ];
  const ago = (h) => h.y == null ? "" : `<span class="hl-ago">今から${(NOW - h.y).toLocaleString()}年前</span>`;
  box.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="hgr" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#9ee6ff"/><stop offset=".5" stop-color="#ffd36e"/><stop offset="1" stop-color="#d6a1ff"/></linearGradient></defs></svg>` +
    H.map((h, i) => `<li class="hl-it${i % 2 ? " r" : ""}"><span class="hl-dot" aria-hidden="true"></span><div class="hl-card">
      <div class="hl-top"><svg class="hl-art" viewBox="0 0 48 40" width="56" height="46" aria-hidden="true">${ART[h.art]}</svg><div><span class="hl-era">${esc(h.era)}${h.y ? `・${h.y}年` : h.when ? `・${h.when}` : ""}</span><b>${esc(h.t)}</b>${ago(h)}</div></div>
      <p>${esc(h.d)}</p></div></li>`).join("");
})();
