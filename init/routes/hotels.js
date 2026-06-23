// init/routes/hotels.js
const express = require('express');
const router = express.Router();

let hotelsData = [];
try {
  hotelsData = require('../models/hotels'); // the file above
} catch (e) {
  console.error('Hotels dataset not found', e);
  hotelsData = [];
}

// Helper: safe copy
function getAllHotels() {
  return Array.isArray(hotelsData) ? hotelsData : [];
}

// Listing: /hotels?page=1&district=&q=&price=min-max&rating=4+
router.get('/', (req, res) => {
  try {
    let page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = 12;
    const q = (req.query.q || '').toLowerCase();
    const district = (req.query.district || '').toLowerCase();
    const priceRange = req.query.price || ''; // ex: 0-3000
    const minRating = parseFloat(req.query.rating || '0');
    const availability = (req.query.availability || '').toLowerCase();

    let list = getAllHotels();

    // filters
    if (q) {
      list = list.filter(h => (h.name||'').toLowerCase().includes(q) || (h.address||'').toLowerCase().includes(q));
    }
    if (district) {
      list = list.filter(h => (h.district||'').toLowerCase() === district);
    }
    if (priceRange) {
      const parts = priceRange.split('-').map(v=>parseFloat(v)||0);
      list = list.filter(h => h.price_from >= parts[0] && h.price_from <= (parts[1] || 1e9));
    }
    if (!isNaN(minRating) && minRating > 0) {
      list = list.filter(h => (h.rating || 0) >= minRating);
    }
    if (availability) {
      list = list.filter(h => (h.availability || '').toLowerCase() === availability);
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total/perPage));
    if (page > totalPages) page = totalPages;
    const paged = list.slice((page-1)*perPage, page*perPage);

    // derive distinct districts for filter UI
    const districts = Array.from(new Set(getAllHotels().map(h=>h.district).filter(Boolean))).sort();

    res.render('hotels/index', {
      hotels: paged,
      page, totalPages, total,
      q: req.query.q || '',
      districts,
      selectedDistrict: req.query.district || '',
      selectedAvailability: req.query.availability || ''
    });
  } catch (err) {
    console.error('GET /hotels error', err);
    res.status(500).send('Server error');
  }
});

// /hotels/:id
router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const list = getAllHotels();
    const hotel = list.find(h => h.id === id || h.id === decodeURIComponent(id));
    if (!hotel) return res.status(404).render('404', { message: 'Hotel not found' });

    // nearby hotels: same district, exclude self, limit 4
    const nearby = list.filter(h => h.id !== hotel.id && h.district === hotel.district).slice(0,4);
    res.render('hotels/show', { hotel, nearby });
  } catch (err) {
    console.error('GET /hotels/:id error', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
