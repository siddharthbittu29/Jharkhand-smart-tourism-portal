// init/public/js/places-client.js
// Client-side search, filter toggle, bookmark management, shimmer handling

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const shimmer = document.getElementById('shimmer');
  const grid = document.getElementById('placesGrid');

  // Hide shimmer after load (small delay to show effect)
  setTimeout(()=> {
    if(shimmer) shimmer.style.display='none';
    if(grid) grid.style.opacity=1;
    // restore bookmarks icons
    restoreBookmarks();
  }, 700);

  // Filter buttons behavior
  filterBtns.forEach(b => {
    b.addEventListener('click', () => {
      filterBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const cat = b.getAttribute('data-cat') || '';
      // reload page with category query for server-side pagination + SEO
      const q = searchInput ? searchInput.value.trim() : '';
      const url = buildUrl({ page:1, category: cat, q });
      window.location.href = url;
    });
  });

  // Search behavior (send to server for pagination & SEO)
  if (searchBtn) searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    const category = document.querySelector('.filter-btn.active')?.getAttribute('data-cat') || '';
    const url = buildUrl({ page:1, category, q });
    window.location.href = url;
  });
  if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });

  // Bookmark functionality (localStorage)
  document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.bookmark-btn')) {
      const id = e.target.getAttribute('data-id');
      toggleBookmark(id, e.target);
    }
  });

  // Mark bookmark icons if already bookmarked
  function restoreBookmarks(){
    const stored = JSON.parse(localStorage.getItem('jh_bookmarks') || '[]');
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (stored.includes(id)) btn.innerHTML = '&#9733;'; // filled star
      else btn.innerHTML = '&#9734;'; // empty star
    });
  }

  function toggleBookmark(id, btn) {
    if (!id) return;
    let stored = JSON.parse(localStorage.getItem('jh_bookmarks') || '[]');
    const idx = stored.indexOf(id);
    if (idx === -1) {
      stored.push(id);
      btn.innerHTML = '&#9733;';
    } else {
      stored.splice(idx,1);
      btn.innerHTML = '&#9734;';
    }
    localStorage.setItem('jh_bookmarks', JSON.stringify(stored));
  }

  // Build URL helper
  function buildUrl({ page=1, category='', q='' } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (page) params.set('page', page);
    return '/places?' + params.toString();
  }
});
