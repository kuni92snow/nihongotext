// ===== Language helpers =====
const getLang = () => localStorage.getItem('lang') || 'en';
const setLang = (v) => localStorage.setItem('lang', v);

// ===== injectPartials(options) =====
// options = { hideLearnNav: true/false, titleTargets: [{el,textEn,textJa}], titleDoc:{en,ja}, onLangApply(lang) }
async function injectPartials(options = {}) {
  const hdr = document.getElementById('site-header');
  const ftr = document.getElementById('site-footer');

  // header
  try {
    const h = await fetch('/partials/header.html', { cache: 'no-store' })
      .then(r => r.ok ? r.text() : Promise.reject());
    if (hdr) hdr.innerHTML = h;
  } catch (_) {
    if (hdr) {
      hdr.innerHTML =
        '<div style="padding:14px 0;display:flex;gap:14px;align-items:center;justify-content:center;flex-direction:column">' +
        '<a href="/" style="font-weight:800;font-size:32px;color:#e6462d;text-decoration:none">nihongotext<span style="color:#333">.com</span></a>' +
        '<div style="font-size:20px;color:#98a1a8">== beta version ==</div>' +
        '</div>';
    }
  }

  // footer
  try {
    const t = await fetch('/partials/footer.html', { cache: 'no-store' })
      .then(r => r.ok ? r.text() : Promise.reject());
    if (ftr) ftr.innerHTML = t;
  } catch (_) {
    if (ftr) {
      ftr.innerHTML =
        '<div style="text-align:center;color:#98a1a8;font-size:12px;padding:12px 0">© 2025 nihongotext.com</div>';
    }
  }

  // 1) Learning/Learned を非表示（index 以外で使う場合）
  if (options.hideLearnNav && hdr) {
    const nav = hdr.querySelector('nav[aria-label="Learning navigation"]');
    if (nav) nav.style.display = 'none';
  }

  // 2) 言語トグル（無ければ追加）
  let langBtn = hdr ? hdr.querySelector('#langBtn') : null;
  if (!langBtn && hdr) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding-top:6px';
    langBtn = document.createElement('button');
    langBtn.id = 'langBtn';
    langBtn.className = 'btn';
    wrap.appendChild(langBtn);
    hdr.appendChild(wrap);
  }

  function applyLang() {
    const lang = getLang();
    if (langBtn) langBtn.textContent = (lang === 'en') ? '日本語' : 'English';

    // 3) ページ見出しの切替
    (options.titleTargets || []).forEach(t => {
      if (!t || !t.el) return;
      t.el.textContent = (lang === 'ja' ? (t.textJa || t.textEn || '') : (t.textEn || t.textJa || ''));
    });

    // 4) document.title の切替
    if (options.titleDoc) {
      document.title = (lang === 'ja' ? options.titleDoc.ja : options.titleDoc.en);
    }

    if (typeof options.onLangApply === 'function') options.onLangApply(lang);
  }

  if (langBtn) {
    langBtn.onclick = () => { setLang(getLang() === 'en' ? 'ja' : 'en'); applyLang(); };
  }
  applyLang();
}

// どこからでも使えるように公開
window.injectPartials = injectPartials;
