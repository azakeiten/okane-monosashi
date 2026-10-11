// おかねの物差し：学校に通うのに、1年でいくらかかる？（子供の学習費調査）
(() => {
  const D = window, { $, yen, esc, store, hmText } = D.OK;
  const S = D.SCHOOL, byId = (id) => S.find((s) => s.id === id);
  const ORDER = ["kg-pub", "kg-pri", "es-pub", "es-pri", "jh-pub", "jh-pri", "hs-pub", "hs-pri"];
  const PARTS = [["edu", "学校教育費", "var(--seg1)", "授業料・教材・遠足や修学旅行・制服・通学など"], ["lunch", "給食費", "var(--seg6)", "学校の給食"], ["out", "塾・習いごとなど", "var(--seg3)", "塾・家庭教師・参考書・スポーツや音楽の習いごと"]];
  let level = store.get("scLevel", "es"), type = store.get("scType", "pub");
  $("scLevel").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; level = b.dataset.v; store.set("scLevel", level); render(); });
  $("scType").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; type = b.dataset.v; store.set("scType", type); render(); });
  const K = D.KAKEI, famYear = K["消費支出"][K["消費支出"].length - 1];

  function render() {
    [...$("scLevel").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === level)));
    [...$("scType").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === type)));
    const s = byId(`${level}-${type}`), w = D.OK.wage();
    $("scLabel").textContent = `${s.t}に1年間通うと（子ども1人あたりの平均）`;
    $("scValue").innerHTML = `${yen(s.total)}<span class="u">円</span>`;
    const hrs = s.total / w;
    $("scSub").innerHTML = `1か月あたり約<b>${yen(s.total / 12)}円</b>。${s.y}年間通うと約<b>${Math.round(s.total * s.y / 1e4).toLocaleString()}万円</b>です。最低賃金（時給${yen(w)}円）ではたらくと約${Math.round(hrs).toLocaleString()}時間ぶん、家族が1年に使うお金（家計調査）の約${Math.round(s.total / famYear * 100)}%にあたります。`;
    $("scBar").innerHTML = PARTS.filter(([k]) => s[k] > 0).map(([k, t, c]) => `<div style="flex:${s[k]};background:${c}" title="${t} ${yen(s[k])}円"></div>`).join("");
    $("scList").innerHTML = PARTS.map(([k, t, c, d]) => `<div class="ded"><span class="sw" style="background:${c}"></span><div><div class="name">${t}</div><div class="what">${d}</div></div><span class="amt">${s[k] > 0 ? yen(s[k]) + "円（" + Math.round(s[k] / s.total * 100) + "%）" : "調査なし"}</span></div>`).join("");
    drawBars(s.id);
  }
  function drawBars(sel) {
    const max = Math.max(...S.map((s) => s.total));
    $("scBars").innerHTML = ORDER.map((id) => { const s = byId(id); return `<button type="button" class="sc-row${id === sel ? " on" : ""}" data-id="${id}"><span class="nm">${esc(s.t.replace("（全日制）", ""))}</span><span class="tr" style="width:${s.total / max * 100}%">${PARTS.filter(([k]) => s[k] > 0).map(([k, , c]) => `<i style="flex:${s[k]};background:${c}"></i>`).join("")}</span><span class="v">${(s.total / 1e4).toFixed(1)}万円</span></button>`; }).join("");
    $("scBars").querySelectorAll(".sc-row").forEach((b) => b.addEventListener("click", () => { [level, type] = b.dataset.id.split("-"); store.set("scLevel", level); store.set("scType", type); render(); }));
    // 幼稚園3年＋小学校6年＋中学校3年＋高校3年の合計
    const sum = (t) => ["kg", "es", "jh", "hs"].reduce((a, l) => { const s = byId(`${l}-${t}`); return a + s.total * s.y; }, 0);
    $("scTotal").innerHTML = `幼稚園から高校まで15年間の合計は、<b>ぜんぶ公立で約${Math.round(sum("pub") / 1e4).toLocaleString()}万円</b>、<b>ぜんぶ私立で約${Math.round(sum("pri") / 1e4).toLocaleString()}万円</b>（この調査の平均から計算）。公立小学校では、学校に払うお金より、塾や習いごとのお金のほうが多くなっています。`;
  }
  D.OK.onUnit(render);
  render();
})();
