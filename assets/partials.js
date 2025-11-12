/* ======================================================
 * nihongotext.com - Common partials loader
 * - Header / Footer injection
 * - Language toggle
 * ====================================================== */

window.injectPartials = async function (options = {}) {
  // ===== header/footer 読み込み =====
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) {
    const res = await fetch("/partials/header.html");
    header.innerHTML = await res.text();
  }
  if (footer) {
    const res = await fetch("/partials/footer.html");
    footer.innerHTML = await res.text();
  }

  // ===== 言語トグルボタンの生成 =====
  const hdr = document.querySelector("header .container, #site-header, header.site-header");
  if (hdr) {
    const wrap = document.createElement("div");
    wrap.style.cssText = `
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin-top: 6px;
      margin-bottom: 4px;
    `;

    const langBtn = document.createElement("button");
    langBtn.id = "langBtn";
    langBtn.textContent = getLang() === "ja" ? "日本語" : "EN";
    langBtn.style.cssText = `
      background: #fff7f6;
      border: 1px solid #e6462d;
      color: #e6462d;
      border-radius: 999px;
      padding: 6px 14px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all .2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      margin-right: 6px;
    `;
    langBtn.onmouseover = () => (langBtn.style.background = "#ffeceb");
    langBtn.onmouseout = () => (langBtn.style.background = "#fff7f6");

    langBtn.onclick = () => {
      const newLang = getLang() === "ja" ? "en" : "ja";
      localStorage.setItem("lang", newLang);
      applyLang();
    };

    wrap.appendChild(langBtn);
    hdr.appendChild(wrap);
  }

  // ===== 言語取得関数 =====
  function getLang() {
    return localStorage.getItem("lang") || "en";
  }

  // ===== 言語適用処理 =====
  function applyLang() {
    const lang = getLang();
    const btn = document.getElementById("langBtn");
    if (btn) btn.textContent = lang === "ja" ? "日本語" : "EN";

    if (options.titleTargets && Array.isArray(options.titleTargets)) {
      options.titleTargets.forEach((t) => {
        if (!t.el) return;
        t.el.textContent = lang === "ja" ? t.ja || t.en : t.en || t.ja;
      });
    }

    if (options.titleDoc) {
      document.title = lang === "ja" ? options.titleDoc.ja : options.titleDoc.en;
    }

    if (typeof options.onLangApply === "function") {
      options.onLangApply(lang);
    }
  }

  // 初期適用
  applyLang();

  // ===== Learning/Learned 表示制御 =====
  if (options.hideLearningNav) {
    const learnNav = document.querySelector("nav[aria-label='Learning navigation']");
    if (learnNav) learnNav.style.display = "none";
  }
};
