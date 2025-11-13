/**
 * assets/partials.js
 * - /partials/header.html と /partials/footer.html を読み込む共通ローダー
 * - 日本語トグル（自動生成）で各ページの onLangApply を呼び出す
 * - blog/index.html / inquiry/index.html の両方で動作
 */

(function () {
  const STORAGE_KEY = "nt_lang"; // "ja" / "en" を保存

  function getInitialLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ja" || stored === "en") return stored;
    } catch (_) {}
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "en";
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }

  function applyRootLang(lang) {
    const isJa = lang === "ja";
    document.documentElement.lang = isJa ? "ja" : "en";
    document.documentElement.dataset.lang = isJa ? "ja" : "en";
  }

  async function loadPartial(targetId, url) {
    const host = document.getElementById(targetId);
    if (!host) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const html = await res.text();
      host.innerHTML = html;
    } catch (e) {
      console.warn("partials.js: failed to load", url, e);
    }
  }

  /**
   * 共通：言語適用 → ページ固有 onLangApply コール
   */
  function applyLanguageEverywhere(lang, opts) {
    opts = opts || {};
    applyRootLang(lang);

    // blog / inquiry などでは Learning ナビを隠したい
    if (opts.hideLearningNav) {
      const nav = document.querySelector('nav[aria-label="Learning navigation"]');
      if (nav) nav.style.display = "none";
    }

    if (typeof opts.onLangApply === "function") {
      try {
        opts.onLangApply(lang);
      } catch (e) {
        console.warn("partials.js: onLangApply error", e);
      }
    }
  }

  /**
   * 日本語トグルボタンをヘッダーに作成＆初期化
   */
  function initLangToggle(opts) {
    opts = opts || {};
    // 1) 挿入先のヘッダー要素を探す
    const hdr =
      document.querySelector("[data-site-header]") ||
      document.getElementById("site-header") ||
      document.querySelector("header");
    if (!hdr) return;

    // 2) 既にボタンがあればそれを使う／無ければ作成
    let btn = document.querySelector("#lang-toggle");
    if (!btn) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "margin-left:auto;display:flex;align-items:center;gap:8px;";

      btn = document.createElement("button");
      btn.id = "lang-toggle";
      btn.type = "button";
      btn.style.cssText =
        "padding:4px 14px;border-radius:999px;border:1px solid #e6462d;" +
        "background:#fff;color:#e6462d;font-size:12px;font-weight:600;" +
        "cursor:pointer;line-height:1;";

      wrap.appendChild(btn);

      // ヘッダー右側に差し込む（既存ナビの後ろ）
      if (hdr.lastElementChild) {
        hdr.lastElementChild.insertAdjacentElement("afterend", wrap);
      } else {
        hdr.appendChild(wrap);
      }
    }

    // 3) 初期状態
    const current = getInitialLang();
    btn.setAttribute("data-lang", current);
    btn.textContent = current === "ja" ? "English" : "日本語";
    applyLanguageEverywhere(current, opts);

    // 4) クリックでトグル
    btn.addEventListener("click", function () {
      const now = btn.getAttribute("data-lang") || getInitialLang();
      const next = now === "ja" ? "en" : "ja";
      setLang(next);
      btn.setAttribute("data-lang", next);
      btn.textContent = next === "ja" ? "English" : "日本語";
      applyLanguageEverywhere(next, opts);
    });
  }

  async function runWithOptions(opts) {
    // header / footer 読み込み
    await Promise.all([
      loadPartial("site-header", "/partials/header.html"),
      loadPartial("site-footer", "/partials/footer.html"),
    ]);

    // 読み込み後にトグルを組み立てる
    initLangToggle(opts);
  }

  /**
   * 各ページから呼び出す API
   * 例：
   *   window.injectPartials({
   *     hideLearningNav: true,
   *     onLangApply(lang){ ... }   // blog/inquiry それぞれのテキスト切替
   *   });
   */
  window.injectPartials = function (opts) {
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        function () {
          runWithOptions(opts);
        },
        { once: true }
      );
    } else {
      runWithOptions(opts);
    }
  };
})();
