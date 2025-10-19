// contact.js  (Cloudflare Pages + GAS対応 / CORSプリフライト回避)

document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector("#contactForm");
  const modal = document.querySelector("#contactModal");
  const closeBtn = document.querySelector("#contactClose");
  const sendBtn = document.querySelector("#contactSend");

  // ←★ GASのURL（/exec）を設定してください
  const endpoint = "https://script.google.com/macros/s/AKfycbzyHV_NSyJU-hPwvJU5JJMMuPAa7V3vhmRuq6Clq7WBIErCx6A2xHgG1SXtSlfmR42OHw/exec";

  // モーダルを閉じる
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.setAttribute("aria-hidden", "true");
    });
  }

  // 送信処理
  if (sendBtn && form) {
    sendBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const name = form.querySelector("[name='cName']").value.trim();
      const email = form.querySelector("[name='cEmail']").value.trim();
      const message = form.querySelector("[name='cInput']").value.trim();

      if (!name || !email || !message) {
        alert("未入力の項目があります。");
        return;
      }

      const payload = {
        name,
        email,
        message,
        path: location.pathname
      };

      sendBtn.disabled = true;
      sendBtn.textContent = "送信中…";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          // ←★ プリフライト(OPTIONS)を回避
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (result.ok) {
          sendBtn.textContent = "送信しました ✅";
          form.reset();
        } else {
          sendBtn.textContent = "送信失敗";
        }
      } catch (err) {
        console.error("送信エラー:", err);
        sendBtn.textContent = "送信失敗";
      }

      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.textContent = "送信 / Send";
      }, 2000);
    });
  }
});
