/**
 * assets/partials.js
 * - /partials/header.html と /partials/footer.html を読み込む共通ローダー
 * - 日本語トグル（#lang-toggle）と連携して、各ページの onLangApply を呼び出す
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
    // CSS用のフラグ（必要なら）
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
   * lang を適用したあとに、ページ側の onLangApply を呼ぶためのヘルパ
   */
  function applyLanguageEverywhere(lang, opts) {
    applyRootLang(lang);

    // Learning / Learned ナビを隠したいページ（blog / inquiry など）
    if (opts && opts.hideLearningNav) {
      const nav = document.querySelector('nav[aria-label="Learning navigation"]');
      if (nav) nav.style.display = "none";
    }

    // 各ページ専用の処理（blog/index.html, inquiry/index.htmlなど）
    if (opts && typeof opts.onLangApply === "function") {
      try {
        opts.onLangApply(lang);
      } catch (e) {
        console.warn("partials.js: onLangApply error", e);
      }
    }
  }

  /**
   * ヘッダー内の #lang-toggle ボタンを初期化
   */
  function initLangToggle(opts) {
    const btn = document.querySelector("#lang-toggle");
    const current = getInitialLang();

    // 初期状態を反映
    applyLanguageEverywhere(current, opts);
    if (btn) {
      btn.setAttribute("data-lang", current);
    }

    if (!btn) return; // ボタンがないページも想定

    btn.addEventListener("click", function () {
      const now = btn.getAttribute("data-lang") || getInitialLang();
      const next = now === "ja" ? "en" : "ja";
      setLang(next);
      btn.setAttribute("data-lang", next);
      applyLanguageEverywhere(next, opts);
    });
  }

  async function runWithOptions(opts) {
    opts = opts || {};

    // header / footer の読み込み
    await Promise.all([
      loadPartial("site-header", "/partials/header.html"),
      loadPartial("site-footer", "/partials/footer.html"),
    ]);

    // 言語トグルを初期化（ヘッダー挿入後に実行する必要がある）
    initLangToggle(opts);
  }

  /**
   * 各ページから呼び出す API
   * 例：
   *   window.injectPartials({
   *     hideLearningNav: true,
   *     onLangApply(lang){ ... }
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
