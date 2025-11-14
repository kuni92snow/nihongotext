// =========================================
// 共通：言語管理ヘルパ
// =========================================
const NT_LANG_KEY = "nt_lang";

/** 現在の言語を取得（未設定なら en） */
function getInitialLang() {
  try {
    return localStorage.getItem(NT_LANG_KEY) || "en";
  } catch (_) {
    return "en";
  }
}

/** 言語を保存 */
function setLang(lang) {
  try {
    localStorage.setItem(NT_LANG_KEY, lang);
  } catch (_) {
    // ignore
  }
}

/** 外部からも使えるように */
window.getLang = getInitialLang;

/**
 * ページ共通の「言語適用」
 *  - titleDoc: { en, ja }
 *  - titleTargets: [{ el, en, ja }]
 *  - onLangApply(lang): コールバック
 */
function applyLanguageEverywhere(lang, opts) {
  opts = opts || {};

  // ページ title
  if (opts.titleDoc) {
    const t = lang === "ja" ? (opts.titleDoc.ja || opts.titleDoc.en) : (opts.titleDoc.en || opts.titleDoc.ja);
    if (t) document.title = t;
  }

  // ページ内のタイトルなど
  if (Array.isArray(opts.titleTargets)) {
    opts.titleTargets.forEach(t => {
      if (!t || !t.el) return;
      t.el.textContent = lang === "ja"
        ? (t.ja || t.en || t.el.textContent)
        : (t.en || t.ja || t.el.textContent);
    });
  }

  // 追加の処理（各ページ側）
  if (typeof opts.onLangApply === "function") {
    opts.onLangApply(lang);
  }
}

// =========================================
// 日本語トグルボタン作成
// =========================================
function initLangToggle(opts) {
  opts = opts || {};

  const hdr =
    document.querySelector("[data-site-header]") ||
    document.getElementById("site-header") ||
    document.querySelector("header");
  if (!hdr) return;

  // 右上ホルダー
  const holder = document.getElementById("header-lang-toggle-holder");

  // ボタンを作成 or 取得
  let btn = document.querySelector("#lang-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "lang-toggle";
    btn.type = "button";
    btn.style.cssText =
      "padding:4px 14px;border-radius:999px;border:1px solid #e6462d;" +
      "background:#fff;color:#e6462d;font-size:12px;font-weight:600;" +
      "cursor:pointer;line-height:1;";
  }

  // 右上ホルダーがあればそこに入れる
  if (holder) {
    holder.innerHTML = "";
    holder.appendChild(btn);
  } else {
    // ホルダーが無いページでは、右端寄せで追加
    let wrap = document.getElementById("lang-toggle-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "lang-toggle-wrap";
      wrap.style.cssText =
        "margin-left:auto;display:flex;align-items:center;gap:8px;";
      wrap.appendChild(btn);

      if (hdr.lastElementChild) {
        hdr.lastElementChild.insertAdjacentElement("afterend", wrap);
      } else {
        hdr.appendChild(wrap);
      }
    } else if (!wrap.contains(btn)) {
      wrap.appendChild(btn);
    }
  }

  // 初期状態
  const current = getInitialLang();
  btn.setAttribute("data-lang", current);
  btn.textContent = current === "ja" ? "English" : "日本語";
  applyLanguageEverywhere(current, opts);

  // クリックでトグル
  btn.addEventListener("click", function () {
    const now = btn.getAttribute("data-lang") || getInitialLang();
    const next = now === "ja" ? "en" : "ja";
    setLang(next);
    btn.setAttribute("data-lang", next);
    btn.textContent = next === "ja" ? "English" : "日本語";
    applyLanguageEverywhere(next, opts);
  });
}

// =========================================
// 共通：ヘッダー／フッターを挿入
// =========================================
async function injectPartials(opts) {
  opts = opts || {};

  // 挿入先
  const headerHost =
    document.querySelector("[data-site-header]") ||
    document.getElementById("site-header") ||
    document.querySelector("header");
  const footerHost =
    document.querySelector("[data-site-footer]") ||
    document.getElementById("site-footer") ||
    document.querySelector("footer.site-footer");

  // ヘッダー読み込み
  if (headerHost) {
    try {
      const r = await fetch("/partials/header.html", { cache: "no-store" });
      if (r.ok) {
        const html = await r.text();
        headerHost.innerHTML = html;
      }
    } catch (e) {
      console.warn("header.html load error", e);
    }
  }

  // フッター読み込み
  if (footerHost) {
    try {
      const r = await fetch("/partials/footer.html", { cache: "no-store" });
      if (r.ok) {
        const html = await r.text();
        footerHost.innerHTML = html;
      }
    } catch (e) {
      console.warn("footer.html load error", e);
    }
  }

  // Learning / Learned を隠したいページ（ブログなど）
  if (opts.hideLearningNav) {
    const nav = document.querySelector(".header-learning-nav");
    if (nav) nav.style.display = "none";
  }

  // 言語トグルを設置
  initLangToggle(opts);
}

// 外から使えるように公開
window.injectPartials = injectPartials;
