<!-- /assets/partials.js -->
<script>
  (async function loadPartials(){
    // ヘッダー／フッターを読み込み
    const [h, f] = await Promise.all([
      fetch('/partials/header.html', {cache:'no-cache'}).then(r=>r.text()),
      fetch('/partials/footer.html', {cache:'no-cache'}).then(r=>r.text()),
    ]);
    const hC = document.querySelector('[data-partial="header"]');
    const fC = document.querySelector('[data-partial="footer"]');
    if (hC) hC.innerHTML = h;
    if (fC) fC.innerHTML = f;

    // 言語トグル（?lang=ja / ?lang=en を切替）
    const langBtn = document.getElementById('langBtn');
    if (langBtn){
      const params = new URLSearchParams(location.search);
      const isJA = params.get('lang') === 'ja';
      langBtn.textContent = isJA ? 'English' : '日本語';
      langBtn.addEventListener('click', ()=>{
        const p = new URLSearchParams(location.search);
        if (p.get('lang') === 'ja') { p.delete('lang'); }
        else { p.set('lang','ja'); }
        const q = p.toString();
        location.href = location.pathname + (q ? ('?'+q) : '');
      });
    }
  })();
</script>
