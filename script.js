'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const invitation = $('invitation');
  const gift = $('gift');
  const openButton = $('open-gift');
  const dialog = $('message-dialog');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let transitionTimer, toastTimer, animationFrame;

  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4200);
  }

  function celebrate() {
    if (reduceMotion.matches) return;
    const canvas = $('confetti');
    const context = canvas.getContext('2d');
    if (!context) return;
    cancelAnimationFrame(animationFrame);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const colors = ['#e35b31', '#edb45f', '#193d30', '#90aa6b', '#fffdf4'];
    const pieces = Array.from({length: 110}, () => ({
      x: width / 2, y: height * .32,
      vx: (Math.random() - .5) * 13,
      vy: -5 - Math.random() * 11,
      size: 4 + Math.random() * 6,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .2,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > .8
    }));
    let start, last;
    function draw(now) {
      if (!start) { start = now; last = now; }
      const delta = Math.min((now - last) / 16.67, 2);
      last = now;
      context.clearRect(0, 0, width, height);
      const elapsed = now - start;
      context.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - 2200) / 1000);
      for (const p of pieces) {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += .17 * delta;
        p.rotation += p.spin * delta;
        context.save();
        context.translate(p.x, p.y);
        context.rotate(p.rotation);
        context.fillStyle = p.color;
        if (p.round) {
          context.beginPath();
          context.arc(0, 0, p.size * .45, 0, Math.PI * 2);
          context.fill();
        } else context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .65);
        context.restore();
      }
      if (elapsed < 3200) animationFrame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    }
    animationFrame = requestAnimationFrame(draw);
  }

  openButton.addEventListener('click', () => {
    openButton.disabled = true;
    invitation.classList.add('opening');
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => {
      invitation.hidden = true;
      gift.hidden = false;
      window.scrollTo({top: 0, behavior: 'instant'});
      $('gift-title').focus({preventScroll: true});
      celebrate();
    }, reduceMotion.matches ? 0 : 320);
  });

  $('message-button').addEventListener('click', () => dialog.showModal());
  $('close-message').addEventListener('click', () => dialog.close());
  $('letter-done').addEventListener('click', () => { dialog.close(); celebrate(); });
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => $('message-button').focus({preventScroll: true}));
  $('replay-button').addEventListener('click', () => {
    cancelAnimationFrame(animationFrame);
    const canvas = $('confetti');
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    gift.hidden = true;
    invitation.hidden = false;
    invitation.classList.remove('opening');
    openButton.disabled = false;
    window.scrollTo({top: 0, behavior: 'instant'});
    openButton.focus({preventScroll: true});
  });
  $('confetti-button').addEventListener('click', () => {
    celebrate();
    if (reduceMotion.matches) toast('Viva os seus 15, Felipe! ✦');
  });

  // This souvenir is self-contained and can be saved independently of the website.
  $('save-button').addEventListener('click', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600"><rect width="1200" height="1600" fill="#f8f5e9"/><rect x="60" y="60" width="1080" height="1480" rx="24" fill="#193d30"/><g fill="#f8f5e9" text-anchor="middle" font-family="Arial,sans-serif"><text x="600" y="160" font-size="22" letter-spacing="6">UMA LEMBRANÇA DOS SEUS</text><text x="575" y="530" fill="#edb45f" font-family="Georgia,serif" font-weight="bold" font-size="365" letter-spacing="-28">15</text><text x="600" y="610" font-size="70" font-style="italic" font-family="Georgia,serif">anos, Felipe!</text><path d="M160 690h880" stroke="#edb45f" stroke-dasharray="10 10"/><text x="600" y="780" font-size="22" letter-spacing="5">VALE PRESENTE · MULLER</text><text x="600" y="935" fill="#edb45f" font-size="145" font-family="Georgia,serif">R$ 150,00</text><text x="600" y="1010" font-size="27">Jaguariaíva · PR</text><text x="600" y="1105" font-size="30">Para você e alguém da sua escolha.</text><text x="600" y="1160" font-size="27">A companhia é sua. O presente é meu.</text><text x="600" y="1290" fill="#edb45f" font-size="43" font-style="italic" font-family="Georgia,serif">Com carinho, Leonardo</text><text x="600" y="1385" font-size="19">Um presente pessoal. Combine o uso com o Leonardo</text><text x="600" y="1418" font-size="19">antes de fazer o pedido.</text></g><path fill="#e35b31" d="m600 1440 8 24 25 8-25 8-8 24-8-24-25-8 25-8Z"/></svg>`;
    const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Felipe-15-anos-presente-do-Leonardo.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('Seu cartão foi preparado para download. Guarde essa lembrança!');
  });
})();

// Photo memories: actual supplied photos, with keyboard-accessible modal viewing.
(() => {
  const dialog = document.getElementById('photo-dialog');
  const image = document.getElementById('photo-image');
  const caption = document.getElementById('photo-caption');
  let opener;
  for (const [id, src, text] of [
    ['photo-portrait', 'assets/photo-3.jpeg', 'O aniversariante, no seu melhor estilo.'],
    ['photo-duo', 'assets/photo-1.jpeg', 'A pose é séria. A resenha, nem tanto.'],
    ['photo-group', 'assets/photo-2.jpeg', 'Gente boa, mesa cheia, história pra contar.']
  ]) {
    document.getElementById(id).addEventListener('click', () => {
      opener = document.getElementById(id);
      image.src = src;
      image.alt = text;
      caption.textContent = text;
      dialog.showModal();
    });
  }
  document.getElementById('close-photo').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
  dialog.addEventListener('click', (event) => {
    const b = dialog.getBoundingClientRect();
    if(event.target === dialog && (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom)) dialog.close();
  });
})();
