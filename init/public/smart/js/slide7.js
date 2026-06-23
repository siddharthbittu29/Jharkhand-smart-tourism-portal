/* ==== AR/VR Modal + 360 panner ==== */
(function(){
  const openBtn = document.getElementById('vrOpenBtn');
  const modal   = document.getElementById('vrModal');
  const closeBtn= document.getElementById('vrCloseBtn');
  const stage   = document.getElementById('vrStage');
  const dayBtn  = document.getElementById('vrDay');
  const nightBtn= document.getElementById('vrNight');
  const narrBtn = document.getElementById('vrNarration');
  const audio   = document.getElementById('vrAudio');

  if(!openBtn || !modal || !stage) return;

  // lazy load background
  function ensureStageBg(){
    const src = stage.getAttribute('data-src');
    if (src && !stage.dataset.ready) {
      const img = new Image();
      img.onload = () => {
        stage.style.backgroundImage = `url('${src}')`;
        stage.dataset.ready = '1';
        const loader = stage.querySelector('.vr-loader');
        if (loader) loader.remove();
      };
      img.src = src;
    }
  }

  function open() {
    modal.hidden = false;
    ensureStageBg();
    openBtn.setAttribute('aria-expanded','true');
    // focus on close for accessibility
    closeBtn.focus();
  }
  function close() {
    modal.hidden = true;
    openBtn.setAttribute('aria-expanded','false');
    audio.pause();
    audio.currentTime = 0;
    openBtn.focus();
  }

  openBtn.addEventListener('click', open);
  openBtn.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e)=> { if (e.target.dataset.close) close(); });
  document.addEventListener('keydown', (e)=> { if (!modal.hidden && e.key === 'Escape') close(); });

  // drag-to-pan + wheel zoom
  let dragging = false, lastX = 0, bgX = 50, zoom = 110; // % height
  const apply = () => {
    stage.style.backgroundPosition = `${bgX}% 50%`;
    stage.style.backgroundSize = `auto ${zoom}%`;
  };
  stage.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; });
  stage.addEventListener('mouseup',   () => dragging = false);
  stage.addEventListener('mouseleave',() => dragging = false);
  stage.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    bgX = Math.max(-100, Math.min(200, bgX - dx * 0.15)); // wrap-ish range
    apply();
  });
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.max(90, Math.min(180, zoom + (e.deltaY > 0 ? -4 : 4)));
    apply();
  }, { passive: false });

  // touch
  stage.addEventListener('touchstart', e => { dragging = true; lastX = e.touches[0].clientX; }, {passive:true});
  stage.addEventListener('touchend',   () => dragging = false);
  stage.addEventListener('touchmove',  e => {
    if (!dragging) return;
    const x = e.touches[0].clientX; const dx = x - lastX; lastX = x; bgX = Math.max(-100, Math.min(200, bgX - dx * 0.25)); apply();
  }, {passive:true});

  // day / night toggle
  const setDay = () => { stage.classList.remove('is-night'); dayBtn.classList.add('active'); nightBtn.classList.remove('active'); dayBtn.setAttribute('aria-pressed','true'); nightBtn.setAttribute('aria-pressed','false'); };
  const setNight = () => { stage.classList.add('is-night'); nightBtn.classList.add('active'); dayBtn.classList.remove('active'); nightBtn.setAttribute('aria-pressed','true'); dayBtn.setAttribute('aria-pressed','false'); };
  dayBtn.addEventListener('click', setDay);
  nightBtn.addEventListener('click', setNight);

  // narration
  let playing = false;
  narrBtn.addEventListener('click', () => {
    if (!playing) { audio.play().catch(()=>{}); narrBtn.classList.add('active'); narrBtn.textContent = 'Pause Narration'; }
    else { audio.pause(); narrBtn.classList.remove('active'); narrBtn.textContent = 'Cultural Narration'; }
    playing = !playing;
  });
  audio.addEventListener('ended', () => { playing = false; narrBtn.classList.remove('active'); narrBtn.textContent = 'Cultural Narration'; });

  // initial
  apply();
})();
