(function(){
  const openBtn = document.getElementById('openVr');
  const modal = document.getElementById('vrModal');
  const pano = document.getElementById('pano');
  const dayBtn = document.getElementById('dayBtn');
  const nightBtn = document.getElementById('nightBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const audio = document.getElementById('vrAudio');
  const loader = document.getElementById('vrLoader');

  if(!openBtn || !modal || !pano) return;

  // set pano image
  const src = pano.dataset.src;
  pano.style.setProperty('--pano-url', `url("${src}")`);

  // open/close helpers
  const open = () => {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
    // fake tiny loader to feel app-like
    loader.removeAttribute('aria-hidden');
    setTimeout(() => loader.setAttribute('aria-hidden','true'), 600);
    // defaults
    setDay(true);
  };
  const close = () => {
    modal.classList.remove('show');
    // stop audio
    try{ audio.pause(); audio.currentTime = 0; voiceBtn.setAttribute('aria-pressed','false'); }catch(e){}
    setTimeout(() => modal.hidden = true, 200);
  };

  openBtn.addEventListener('click', open);
  modal.addEventListener('click', (e)=>{ if(e.target.hasAttribute('data-close')) close(); });
  document.addEventListener('keydown', (e)=>{ if(!modal.hidden && e.key === 'Escape') close(); });

  // drag to look
  let dragging = false, startX = 0, startPos = 50;
  pano.addEventListener('mousedown', (e)=>{ dragging=true; startX=e.clientX; pano.classList.add('dragging'); });
  window.addEventListener('mouseup', ()=>{ dragging=false; pano.classList.remove('dragging'); });
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    const newPos = (startPos + dx / 4); // sensitivity
    pano.style.setProperty('--pano-x', `${newPos}%`);
  });
  pano.addEventListener('mouseleave', ()=> dragging=false);
  pano.addEventListener('mouseup', ()=>{
    const bp = pano.style.getPropertyValue('--pano-x') || '50%';
    startPos = parseFloat(bp);
  });

  // touch support
  pano.addEventListener('touchstart', (e)=>{ dragging=true; startX=e.touches[0].clientX; }, {passive:true});
  pano.addEventListener('touchmove', (e)=>{
    if(!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const newPos = (startPos + dx / 4);
    pano.style.setProperty('--pano-x', `${newPos}%`);
  }, {passive:true});
  pano.addEventListener('touchend', ()=>{
    dragging=false;
    const bp = pano.style.getPropertyValue('--pano-x') || '50%';
    startPos = parseFloat(bp);
  });

  // zoom with wheel
  let zoom = 120; // %
  pano.addEventListener('wheel', (e)=>{
    e.preventDefault();
    zoom += (e.deltaY > 0 ? -8 : 8);
    zoom = Math.max(90, Math.min(220, zoom));
    pano.style.setProperty('--pano-zoom', `${zoom}%`);
  }, {passive:false});

  // day/night
  function setDay(isDay){
    pano.classList.toggle('day', isDay);
    pano.classList.toggle('night', !isDay);
    dayBtn.setAttribute('aria-pressed', String(isDay));
    nightBtn.setAttribute('aria-pressed', String(!isDay));
  }
  dayBtn.addEventListener('click', ()=>setDay(true));
  nightBtn.addEventListener('click', ()=>setDay(false));

  // narration
  voiceBtn.addEventListener('click', ()=>{
    const playing = voiceBtn.getAttribute('aria-pressed') === 'true';
    if(playing){ audio.pause(); voiceBtn.setAttribute('aria-pressed','false'); }
    else { audio.play().catch(()=>{}); voiceBtn.setAttribute('aria-pressed','true'); }
  });
})();
