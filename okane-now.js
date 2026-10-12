// おかねの物差し：今の物価（いちばん新しい月）・データの新しさの表
(() => {
  const D = window, { $, yen, esc } = D.OK;
  const L = D.CPI_LATEST;

  // ホームの「今の物価」
  $("nowCpi").innerHTML = `<span class="nk">今の物価</span><span class="nv">+${L.yoy}<small>%</small></span>
    <span class="nt">${L.label}の物価は、1年前より<b>${L.yoy}%</b>上がりました。1年前に1,000円だった買い物は、今は約<b>${yen(1000 * (1 + L.yoy / 100))}円</b>です。</span>
    <span class="ns">全国・総合。総務省統計局「消費者物価指数」${L.published}発表。押すと物価タイムマシンへ。</span><span class="spark" id="nowSpark"></span>`;
  // 画面の幅に合わせて描く（文字の大きさがいつも同じになるように）
  let lastW = 0;
  const drawSpark = () => {
    const cw = $("nowCpi").clientWidth; if (!cw) return;
    const w = Math.round(Math.min(1100, Math.max(280, cw - 40))); if (w === lastW) return;
    lastW = w; $("nowSpark").innerHTML = spark(w);
  };
  drawSpark();
  addEventListener("resize", drawSpark);
  addEventListener("hashchange", () => setTimeout(drawSpark, 50));
  addEventListener("popstate", () => setTimeout(drawSpark, 50));
  document.addEventListener("click", () => setTimeout(drawSpark, 80));

  // 最近2年の上がり方（月ごとの棒）。いちばん高い月と、最新の月に数字をつける
  function spark(W) {
    const M = D.CPI_MONTHLY; if (!M) return "";
    const v = M.yoy, n = v.length, [fy, fm] = M.from.split("-").map(Number);
    const lab = (i) => { const d = new Date(fy, fm - 1 + i, 1); return `${d.getFullYear()}年${d.getMonth() + 1}月`; };
    const H = 92, top = 22, base = 70, max = Math.max(...v, 1), bw = (W - 20) / n;
    const pk = v.indexOf(Math.max(...v));
    let s = `<line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--line)"/>`;
    v.forEach((x, i) => {
      const h = Math.max(1, (x / max) * (base - top)), X = 10 + i * bw;
      s += `<rect x="${X + 1}" y="${base - h}" width="${bw - 3}" height="${h}" rx="2" fill="${i === n - 1 ? "var(--hot)" : "color-mix(in srgb, var(--hot) 45%, var(--card))"}"><title>${lab(i)}：${x}%</title></rect>`;
    });
    const tx = (i) => 10 + i * bw + bw / 2;
    s += `<text x="${tx(pk)}" y="${base - (v[pk] / max) * (base - top) - 6}" text-anchor="middle" class="sp-l">${lab(pk)} ${v[pk]}%</text>`;
    s += `<text x="${tx(0)}" y="${H - 4}" class="sp-a">${lab(0)}</text><text x="${tx(n - 1)}" y="${H - 4}" text-anchor="end" class="sp-a">${lab(n - 1)}</text>`;
    const trend = v[n - 1] < v[pk] ? `いちばん高かった${lab(pk)}の${v[pk]}%から、上がり方はゆっくりになっています。` : "";
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="最近2年の物価の上がり方">${s}</svg><span class="sp-t">最近2年の物価の上がり方（前の年の同じ月とくらべて）。${trend}</span>`;
  }

  // データの新しさ
  $("freshTable").innerHTML = `<thead><tr><th>データ</th><th>今の数字</th><th>次に新しくなる時期（目安）</th><th>更新</th></tr></thead><tbody>` +
    D.DATA_FRESH.map((r) => `<tr><td>${esc(r.what)}</td><td>${esc(r.has)}</td><td>${esc(r.next)}</td><td><span class="fq ${r.freq === "月" ? "m" : ""}">${r.freq === "月" ? "毎月" : "年1回"}</span></td></tr>`).join("") + `</tbody>`;
  const f = document.querySelector("footer .wrap span:last-child");
  $("freshUpdated").textContent = f ? f.textContent.replace("最終更新：", "") : "";
})();
