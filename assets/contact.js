// assets/contact.js
// Cloudflare Pages + Google Apps Script 対応
// - common/contact-modal.html（cc* のID）と一致
// - window.initContactModal(opts) を提供
// - fetch は text/plain でプリフライト回避

(function () {
  function $(sel) { return document.querySelector(sel); }

  async function getRecaptchaToken(sitekey) {
    if (!sitekey) return "";
    try {
      if (!window.grecaptcha) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://www.google.com/recaptcha/api.js?render=" + encodeURIComponent(sitekey);
          s.async = true;
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      return await grecaptcha.execute(sitekey, { action: "contact" });
    } catch (e) {
      return "";
    }
  }

  // -------------------------------
  // 公開API（/blog などから呼ぶ）
  // -------------------------------
  window.initContactModal = function initContactModal(opts) {
    const endpoint = opts?.endpoint || "";               // GAS Webアプリ（/exec）
    const sitekey  = opts?.sitekey  || "";               // reCAPTCHA site key（任意）
    const defaultLang = opts?.defaultLang || "ja";

    // モーダル要素（common/contact-modal.html 準拠）
    const chat    = $("#contactChat");
    const overlay = $("#ccOverlay");
    const closeBtn= $("#ccClose");
    const form    = $("#ccForm");
    const nameEl  = $("#ccName");
    const emailEl = $("#ccEmail");
    const msgEl   = $("#ccInput");
    const sendBtn = $("#ccSend");
    const status  = $("#ccStatus");

    // 開閉
    function open()  { chat?.setAttribute("data-open","1"); }
    function close() { chat?.removeAttribute("data-open"); }

    // トリガ（ヘッダー/フッターの問い合わせボタン）
    ["#openContact","#openContactF"].forEach(sel => {
      const el = $(sel);
      if (el) el.addEventListener("click", (e) => { e.preventDefault(); open(); });
    });
    overlay?.addEventListener("click", close);
    closeBtn?.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    // 送信
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!endpoint) { alert("送信先が未設定です（endpoint）。"); return; }

      const name    = nameEl?.value?.trim()  || "";
      const email   = emailEl?.value?.trim() || "";
      const message = msgEl?.value?.trim()   || "";
      if (!name || !email || !message) {
        status.textContent = (defaultLang === "ja")
          ? "未入力の項目があります。"
          : "Some fields are empty.";
        return;
      }

      sendBtn.disabled = true;
      status.textContent = (defaultLang === "ja")
        ? "送信しています…"
        : "Sending…";

      const payload = {
        name, email, message,
        lang: defaultLang,
        path: location.pathname,
        ua: navigator.userAgent,
        token: await getRecaptchaToken(sitekey)
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          // プリフライト(OPTIONS)を避ける
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.ok === undefined || data.ok === true)) {
          status.textContent = (defaultLang === "ja")
            ? "送信しました。ご連絡ありがとうございます。"
            : "Sent. Thank you!";
          msgEl.value = "";
          setTimeout(close, 1200);
        } else {
          throw new Error(data.error || ("HTTP " + res.status));
        }
      } catch (err) {
        console.error(err);
        status.textContent = (defaultLang === "ja")
          ? "送信に失敗しました。しばらくしてからお試しください。"
          : "Failed to send. Please try again later.";
      } finally {
        sendBtn.disabled = false;
      }
    });
  };
})();
