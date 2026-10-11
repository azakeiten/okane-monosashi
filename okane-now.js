// おかねの物差し：今の物価（いちばん新しい月）・データの新しさの表
(() => {
  const D = window, { $, yen, esc } = D.OK;
  const L = D.CPI_LATEST;

  // ホームの「今の物価」
  $("nowCpi").innerHTML = `<span class="nk">今の物価</span><span class="nv">+${L.yoy}<small>%</small></span>
    <span class="nt">${L.label}の物価は、1年前より<b>${L.yoy}%</b>上がりました。1年前に1,000円だった買い物は、今は約<b>${yen(1000 * (1 + L.yoy / 100))}円</b>です。</span>
    <span class="ns">全国・総合。総務省統計局「消費者物価指数」${L.published}発表。押すと物価タイムマシンへ。</span>`;

  // データの新しさ
  $("freshTable").innerHTML = `<thead><tr><th>データ</th><th>今の数字</th><th>次に新しくなる時期（目安）</th><th>更新</th></tr></thead><tbody>` +
    D.DATA_FRESH.map((r) => `<tr><td>${esc(r.what)}</td><td>${esc(r.has)}</td><td>${esc(r.next)}</td><td><span class="fq ${r.freq === "月" ? "m" : ""}">${r.freq === "月" ? "毎月" : "年1回"}</span></td></tr>`).join("") + `</tbody>`;
  const f = document.querySelector("footer .wrap span:last-child");
  $("freshUpdated").textContent = f ? f.textContent.replace("最終更新：", "") : "";
})();
