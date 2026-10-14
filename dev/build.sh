#!/usr/bin/env bash
# おかねの物差し：dev/okane-monosashi.html から、公開用の index.html を作る
# 使い方（リポジトリのいちばん上で）: bash dev/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=dev/okane-monosashi.html
head_part=$(awk '{print} /^<\/style>$/{exit}' "$SRC")
body_part=$(awk 'f{print} /^<\/style>$/{f=1}' "$SRC")
{
  echo '<!doctype html>'
  echo '<html lang="ja">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<meta name="description" content="ニュースに出てくるお金の数字を、はたらく時間・おこづかい・昔の値段など、自分の生活の単位に直して見せるサイト。数字はすべて国の公的統計。">'
  echo '<meta property="og:title" content="おかねの物差し">'
  echo '<meta property="og:description" content="その値段、あなたの何時間ぶん？ 公的統計で、お金を自分の生活の単位ではかるサイト。">'
  echo '<meta property="og:type" content="website">'
  echo '<meta property="og:url" content="https://azakeiten.github.io/okane-monosashi/">'
  echo '<meta property="og:image" content="https://azakeiten.github.io/okane-monosashi/icons/og.png?v=2">'
  echo '<meta property="og:image:width" content="1200">'
  echo '<meta property="og:image:height" content="630">'
  echo '<meta name="twitter:card" content="summary_large_image">'
  echo '<link rel="manifest" href="manifest.webmanifest">'
  echo '<meta name="theme-color" content="#191f45">'
  echo '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
  echo '<meta name="apple-mobile-web-app-capable" content="yes">'
  echo '<meta name="apple-mobile-web-app-title" content="物差し">'
  echo '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%227%22 fill=%22%23f4b400%22/%3E%3Cpath d=%22M5 24v4M9 26v2M13 24v4M17 26v2M21 24v4M25 26v2%22 stroke=%22%23191f45%22 stroke-width=%221.6%22/%3E%3Ctext x=%2216%22 y=%2219%22 font-size=%2214%22 text-anchor=%22middle%22 font-weight=%22900%22 fill=%22%23191f45%22%3E%E5%86%86%3C/text%3E%3C/svg%3E">'
  echo '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>'
  echo "$head_part"
  echo '</head>'
  echo '<body>'
  echo "$body_part"
  echo '</body>'
  echo '</html>'
} > index.html
touch .nojekyll
STAMP=$(date +%Y%m%d%H%M%S)

# 公開用：たくさんのプログラムファイルを、ページにのっている順に1つ（okane.bundle.js）にまとめる
# （読みこみの回数が1回になり、ネットがおそいときでも早く表示される）
grep -oE '<script src="okane-[a-z]+\.js"></script>' "$SRC" | sed -E 's/.*src="([^"]+)".*/\1/' > /tmp/okane-order.txt
: > okane.bundle.js
while read -r js; do printf '\n/* ===== %s ===== */\n' "$js" >> okane.bundle.js; cat "$js" >> okane.bundle.js; printf '\n;\n' >> okane.bundle.js; done < /tmp/okane-order.txt
# index.html の中の <script src="okane-….js"> を消して、まとめたファイル1つにする
awk -v stamp="$STAMP" '
  /<script src="okane-[a-z]+\.js"><\/script>/ { if (!done) { print "<script src=\"okane.bundle.js?v=" stamp "\"></script>"; done = 1 } next }
  { print }' index.html > index.tmp && mv index.tmp index.html
echo "bundled $(wc -l < /tmp/okane-order.txt) files -> okane.bundle.js ($(wc -c < okane.bundle.js) bytes)"

# オフライン用のしまい場所の名前を、作るたびに新しくする（古いものが残らないように）
sed -i "s/^const VERSION = .*/const VERSION = \"okane-$STAMP\";/" sw.js
echo "built index.html ($(wc -c < index.html) bytes)"
