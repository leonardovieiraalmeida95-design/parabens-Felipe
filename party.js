'use strict';
(() => {
  const stage = document.getElementById('party-welcome');
  if (!stage) return;
  const skip = document.getElementById('party-skip');
  const replay = document.getElementById('replay-welcome');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const backgrounds = [...document.querySelectorAll('body > header, body > main, body > footer')];
  let finishTimer, burstTimer, cleanupTimer, returnFocus;
  let running = false;

  function finish() {
    if (!running) return;
    running = false;
    clearTimeout(finishTimer);
    clearTimeout(burstTimer);
    stage.classList.add('party-leaving');
    // Release the rest of the page immediately; the short fade never traps input.
    for (const element of backgrounds) element.inert = false;
    document.body.classList.remove('party-active');
    returnFocus?.focus({preventScroll:true});
    cleanupTimer = setTimeout(() => { stage.hidden = true; }, reduceMotion.matches ? 0 : 450);
  }

  function start() {
    clearTimeout(finishTimer);
    clearTimeout(burstTimer);
    clearTimeout(cleanupTimer);
    returnFocus = document.activeElement === replay ? replay : document.getElementById('open-gift');
    // Remounting the stage restarts its CSS animation without reading layout.
    stage.hidden = true;
    stage.classList.remove('party-leaving');
    document.body.classList.add('party-active');
    for (const element of backgrounds) element.inert = true;
    requestAnimationFrame(() => {
      stage.hidden = false;
      running = true;
      skip.focus({preventScroll:true});
      window.felipeCelebrate?.('welcome');
      burstTimer = setTimeout(() => window.felipeCelebrate?.('welcome'), 1550);
      finishTimer = setTimeout(finish, reduceMotion.matches ? 1500 : 4400);
    });
  }

  skip.addEventListener('click', finish);
  stage.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') { event.preventDefault(); finish(); }
    if(event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  replay.addEventListener('click', start);
  start();
})();
