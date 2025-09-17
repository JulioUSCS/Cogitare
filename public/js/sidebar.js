// Toggle simples e acessível
(function(){
  const btn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  if (!btn || !menu) {
    console.warn('Elementos do menu não encontrados');
    return;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const opened = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // opcional: fechar menu ao clicar fora (mobile)
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });
})();