// init/public/js/hotels.js
(function(){
  const KEY = 'jh_hotels_favs_v1';
  function readFavs(){ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]} }
  function writeFavs(v){ localStorage.setItem(KEY, JSON.stringify(v)) }

  function refreshFavButtons(){
    document.querySelectorAll('.fav').forEach(btn=>{
      const id = btn.dataset.id;
      const favs = readFavs();
      if (favs.includes(id)) { btn.textContent = '♥'; btn.classList.add('fav-active'); }
      else { btn.textContent = '♡'; btn.classList.remove('fav-active'); }
      btn.onclick = (e)=>{ e.preventDefault(); toggleFav(id); };
    });
  }
  function toggleFav(id){
    const favs = readFavs();
    const idx = favs.indexOf(id);
    if (idx===-1) favs.push(id); else favs.splice(idx,1);
    writeFavs(favs);
    refreshFavButtons();
  }

  document.addEventListener('DOMContentLoaded', function(){
    refreshFavButtons();
    // quick client-side search/filter on index page
    const searchInput = document.getElementById('hotelSearch');
    const districtSel = document.getElementById('filterDistrict');
    const availabilitySel = document.getElementById('filterAvailability');
    const doFilter = document.getElementById('doFilter');
    if (doFilter) doFilter.addEventListener('click', ()=> {
      const q = encodeURIComponent(searchInput.value || '');
      const district = encodeURIComponent(districtSel.value || '');
      const availability = encodeURIComponent(availabilitySel.value || '');
      let url = '/hotels?page=1';
      if (q) url += '&q=' + q;
      if (district) url += '&district=' + district;
      if (availability) url += '&availability=' + availability;
      location.href = url;
    });

    // booking form (UI-only)
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        alert('Booking UI only — integration pending. You entered: ' + new FormData(bookingForm).get('checkin'));
      });
    }
  });
})();
