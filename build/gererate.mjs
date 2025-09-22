import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========= 設定 =========
const SITE = "https://nihongotext.com"; // ← 公開URLに合わせて変更
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_DIR = path.join(BLOG_DIR, "posts");
const OUT_RSS_JA = path.join(BLOG_DIR, "rss_ja.xml");
const OUT_RSS_EN = path.join(BLOG_DIR, "rss_en.xml");
const SITEMAP = path.join(ROOT, "sitemap.xml");

const langs = [
  { code: "ja", file: "posts_ja.json", title: "ブログ", back: "← トップへ戻る" },
  { code: "en", file: "posts_en.json", title: "Blog",  back: "← Back to Home" },
];

// ========= ユーティリティ =========
const ensureDir = d => fs.mkdirSync(d, { recursive: true });
const htmlEscape = s => s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");

// ========= 個別ページテンプレ =========
const pageTpl = ({langTitle, backLabel, id, title, date, body, site}) => `<!doctype html>
<meta charset="utf-8">
<title>${htmlEscape(title)} | ${langTitle} | nihongotext.com</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;margin:0;background:#fafafa;color:#222}
.wrap{max-width:900px;margin:24px auto;padding:0 14px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.card{background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;margin:10px 0}
h1{margin:8px 0 0;font-size:22px}
.meta{color:#777;font-size:12px;margin:6px 0 10px}
a{color:#333;text-decoration:none}
footer{margin:18px 0;color:#666;font-size:13px}
</style>
<div class="wrap">
  <header>
    <a href="../index.html" onclick="window.close();return true">${htmlEscape(backLabel)}</a>
    <strong>${langTitle}</strong>
  </header>
  <article class="card">
    <h1>${htmlEscape(title)}</h1>
    <div class="meta">${htmlEscape(date)}</div>
    <div class="body">${body}</div>
  </article>
  <footer>© 2025 nihongotext.com</footer>
</div>`;

// ========= RSSテンプレ =========
const rssTpl = ({langCode, items}) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>nihongotext.com - ${langCode === "ja" ? "ブログ" : "Blog"}</title>
  <link>${SITE}/blog/</link>
  <description>${langCode === "ja" ? "日本語学習ブログ" : "Japanese learning blog"}</description>
  <language>${langCode === "ja" ? "ja" : "en"}</language>
  ${items.map(it => `
  <item>
    <title>${htmlEscape(it.title)}</title>
    <link>${it.link}</link>
    <guid>${it.link}</guid>
    <pubDate>${new Date(it.date + "T00:00:00Z").toUTCString()}</pubDate>
    <description><![CDATA[${it.body.replaceAll("]]>", "]]]]><![CDATA[>")}]]></description>
  </item>`).join("")}
</channel>
</rss>`;

// ========= 実行 =========
ensureDir(POSTS_DIR);

const allUrls = new Set([
  `${SITE}/NTindex.html`,
  `${SITE}/blog/`
]);

const rssItemsByLang = { ja: [], en: [] };

for (const {code, file, title, back} of langs) {
  const jsonPath = path.join(BLOG_DIR, file);
  const posts = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // 新しい順に
  posts.sort((a,b)=> a.date < b.date ? 1 : -1);

  for (const p of posts) {
    const outName = `${p.id}-${code}.html`;
    const outPath = path.join(POSTS_DIR, outName);

    // 個別ページを書き出し
    fs.writeFileSync(outPath, pageTpl({
      langTitle: title, backLabel: back,
      id: p.id, title: p.title, date: p.date, body: p.body, site: SITE
    }), "utf-8");

    // URL記録（サイトマップ用）
    const url = `${SITE}/blog/posts/${outName}`;
    allUrls.add(url);

    // RSS用アイテム
    rssItemsByLang[code].push({
      title: p.title,
      date: p.date,
      link: url,
      body: p.body
    });
  }
}

// RSS書き出し
fs.writeFileSync(OUT_RSS_JA, rssTpl({langCode: "ja", items: rssItemsByLang.ja}), "utf-8");
fs.writeFileSync(OUT_RSS_EN, rssTpl({langCode: "en", items: rssItemsByLang.en}), "utf-8");

// サイトマップ（全URL出力）
// ※ 既存 sitemap.xml を上書きします。必要なら生成先を SITEMAP_BLOG 等に変えてください。
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...allUrls].map(u=>`  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(SITEMAP, sitemapXml, "utf-8");

console.log("✅ Blog pages, RSS, sitemap generated.");