/**
   * 日本語トグルボタンをヘッダーに作成＆初期化
   */
  function initLangToggle(opts) {
    opts = opts || {};

    const hdr =
      document.querySelector("[data-site-header]") ||
      document.getElementById("site-header") ||
      document.querySelector("header");
    if (!hdr) return;

    // 追加：右上ホルダーを探す
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
      // ホルダーが無いページでは、従来どおり右端寄せ
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
