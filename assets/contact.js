// assets/contact.js
(function(){
  function $(sel){ return document.querySelector(sel); }
  async function getRecaptchaToken(sitekey){
    if(!sitekey) return "";
    try{
      if(!window.grecaptcha){
        await new Promise((res,rej)=>{
          const s=document.createElement('script');
          s.src="https://www.google.com/recaptcha/api.js?render="+encodeURIComponent(sitekey);
          s.async=true; s.onload=res; s.onerror=rej; document.head.appendChild(s);
        });
      }
      return await grecaptcha.execute(sitekey, {action:"contact"});
    }catch(e){ return ""; }
  }

  // 公開API
  window.initContactModal = function(opts){
    const endpoint = opts?.endpoint || "";
    const sitekey  = opts?.sitekey  || ""; // reCAPTCHA v3 site key（あれば）
    const openers  = [ "#openContact", "#openContactF" ];
    const chat = $("#contactChat");
    const overlay = $("#ccOverlay");
    const closeBtn = $("#ccClose");
    const form = $("#ccForm");
    const nameEl = $("#ccName");
    const emailEl = $("#ccEmail");
    const msgEl = $("#ccInput");
    const sendBtn = $("#ccSend");
    const status = $("#ccStatus");

    function open(){ chat?.setAttribute("data-open","1"); }
    function close(){ chat?.removeAttribute("data-open"); }

    openers.forEach(sel=>{
      const el = $(sel);
      if(el) el.addEventListener("click", (e)=>{ e.preventDefault(); open(); });
    });
    overlay?.addEventListener("click", close);
    closeBtn?.addEventListener("click", close);
    document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") close(); });

    form?.addEventListener("submit", async (e)=>{
      e.preventDefault();
      if(!endpoint){ alert("送信先が未設定です（endpoint）。"); return; }
      sendBtn.disabled = true;
      status.textContent = "送信しています… / Sending…";

      const payload = {
        name:  nameEl?.value?.trim() || "",
        email: emailEl?.value?.trim() || "",
        message: msgEl?.value?.trim() || "",
        lang: document.documentElement.lang || "ja",
        path: location.pathname,
        ua: navigator.userAgent,
        token: await getRecaptchaToken(sitekey)
      };

      try{
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        if(res.ok && (data.ok===undefined || data.ok===true)){
          status.textContent = "送信しました。 / Sent. ご連絡ありがとうございます。";
          msgEl.value = "";
          setTimeout(close, 1200);
        }else{
          throw new Error(data.error || ("HTTP "+res.status));
        }
      }catch(err){
        console.error(err);
        status.textContent = "送信に失敗しました。しばらくしてからお試しください。";
      }finally{
        sendBtn.disabled = false;
      }
    });
  };
})();
