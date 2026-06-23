// init/public/js/places.js
(function(){
  const GRID = () => document.getElementById('grid');
  const KEY = 'jh_places_bookmarks_v1';

  function readBookmarks(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; } }
  function writeBookmarks(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  // bookmarks: change button states
  function refreshBookmarks(){
    const list = readBookmarks();
    document.querySelectorAll('.bookmark').forEach(btn=>{
      const id = btn.dataset.id;
      if (list.includes(id)) { btn.classList.add('bookmarked'); btn.textContent = 'Bookmarked'; }
      else { btn.classList.remove('bookmarked'); btn.textContent = 'Bookmark'; }
      btn.onclick = (e)=>{
        e.preventDefault();
        toggleBookmark(id, btn);
      };
    });
  }
  function toggleBookmark(id, btn){
    const list = readBookmarks();
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx,1);
    writeBookmarks(list);
    refreshBookmarks();
  }

  // client side filter (only filters cards currently in DOM)
  window.applyClientFilter = function(){
    const q = document.getElementById('liveSearch')?.value?.toLowerCase() || '';
    const category = document.getElementById('filterCategory')?.value || 'all';
    const district = document.getElementById('filterDistrict')?.value || 'all';
    document.querySelectorAll('.place-card').forEach(card => {
      const name = (card.dataset.name||'').toLowerCase();
      const cat = (card.dataset.category||'').toLowerCase();
      const dist = (card.dataset.district||'').toLowerCase();
      const qMatch = !q || name.includes(q) || cat.includes(q) || dist.includes(q);
      const catMatch = category === 'all' || cat === category.toLowerCase();
      const distMatch = district === 'all' || dist === district.toLowerCase();
      const show = qMatch && catMatch && distMatch;
      if (show) {
        card.style.opacity = 0;
        card.style.transform = 'translateY(8px)';
        card.style.display = '';
        requestAnimationFrame(()=>{ card.style.transition = 'opacity .35s ease, transform .35s ease'; card.style.opacity=1; card.style.transform='translateY(0)';});
      } else {
        card.style.transition = 'opacity .25s ease, transform .25s ease';
        card.style.opacity = 0;
        card.style.transform='translateY(8px)';
        setTimeout(()=> card.style.display = 'none', 300);
      }
    });
  };

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    refreshBookmarks();
    // wire live filter inputs
    document.getElementById('liveSearch')?.addEventListener('input', window.applyClientFilter);
    document.getElementById('filterCategory')?.addEventListener('change', window.applyClientFilter);
    document.getElementById('filterDistrict')?.addEventListener('change', window.applyClientFilter);
    // initial animation
    document.querySelectorAll('.place-card').forEach((c,i)=>{
      c.style.opacity = 0;
      c.style.transform = 'translateY(12px)';
      setTimeout(()=> { c.style.transition = 'opacity .45s ease, transform .45s ease'; c.style.opacity = 1; c.style.transform = 'translateY(0)'; }, 50 + i*60);
    });
    // fallback: if no cards visible - show message
    setTimeout(()=> { if (!document.querySelector('.place-card')) { const g=GRID(); if(g) g.innerHTML='<div class="empty">No places available.</div>'; } }, 600);
  });
})();
