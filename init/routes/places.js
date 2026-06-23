// init/routes/places.js
const express = require('express');
const router = express.Router();

// Try to use your Mongoose Place model if it exists
let PlaceModel = null;
try {
  PlaceModel = require('../models/place');
} catch (e) {
  PlaceModel = null;
}

// Fallback static dataset (make sure file exists)
let fallbackData = [];
try {
  fallbackData = require('../data/places_data');
} catch (e) {
  fallbackData = [];
}

// Optional hotels dataset for "nearby hotels" (not required)
let hotelsList = [];
try {
  hotelsList = require('../models/hotels'); // if present, it's an array
} catch (e) {
  hotelsList = [];
}

// Helper: read places from DB if available, otherwise fallback dataset
async function fetchPlacesFromSource() {
  if (PlaceModel) {
    try {
      const count = await PlaceModel.countDocuments();
      if (count > 0) {
        const docs = await PlaceModel.find().sort({ createdAt: -1 }).lean();
        return docs.map(d => ({
          place_id: d.place_id || String(d._id),
          name: d.name,
          district: d.district,
          category: d.category,
          short_desc: d.description ? d.description.slice(0, 140) : (d.short_desc || ''),
          long_desc: d.description || d.long_desc || '',
          google_map: d.google_map || (d.coordinates ? `https://www.google.com/maps?q=${d.coordinates.lat},${d.coordinates.lng}` : ''),
          image: (d.images && d.images.length) ? (d.images[0].url || d.images[0]) : (d.thumbnail || '/images/placeholder.jpg'),
        }));
      }
    } catch (err) {
      console.warn('places router: DB read failed, falling back to static dataset:', err && err.message);
    }
  }
  // fallback to static dataset (already shaped suitably)
  return Array.isArray(fallbackData) ? fallbackData : [];
}

// Simple filter/search helper
function applyFilters(list, { q, category, district }) {
  let out = list;
  if (q) {
    const ql = q.toLowerCase();
    out = out.filter(p =>
      (p.name && p.name.toLowerCase().includes(ql)) ||
      (p.district && p.district.toLowerCase().includes(ql)) ||
      (p.short_desc && p.short_desc.toLowerCase().includes(ql))
    );
  }
  if (category && category !== 'all') {
    out = out.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
  }
  if (district && district !== 'all') {
    out = out.filter(p => (p.district || '').toLowerCase() === district.toLowerCase());
  }
  return out;
}

// LIST: /places?page=1&q=...&category=...
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = 12;
    const q = req.query.q || '';
    const category = req.query.category || 'all';
    const district = req.query.district || 'all';

    const all = await fetchPlacesFromSource();
    const safeAll = Array.isArray(all) ? all : [];

    const filtered = applyFilters(safeAll, { q, category, district });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const pagePlaces = filtered.slice(start, start + perPage);

    // derive categories & districts for filter UI safely
    const categories = Array.from(new Set(safeAll.map(p => p.category).filter(Boolean))).sort();
    const districts = Array.from(new Set(safeAll.map(p => p.district).filter(Boolean))).sort();

    // Defensive: ensure view always receives defined variables
    return res.render('places/index', {
      places: Array.isArray(pagePlaces) ? pagePlaces : [],
      page: page || 1,
      totalPages: totalPages || 1,
      total: total || 0,
      q: q || '',
      selectedCategory: category || 'all',
      selectedDistrict: district || 'all',
      categories: categories || [],
      districts: districts || []
    });
  } catch (err) {
    console.error('Error in GET /places:', err);
    return res.status(500).send('Server error');
  }
});

// DETAIL: /places/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const all = await fetchPlacesFromSource();
    const safeAll = Array.isArray(all) ? all : [];

    // find the place by place_id or by _id string
    const place = safeAll.find(p => p.place_id === id || String(p.place_id) === id || String(p._id) === id);
    if (!place) {
      return res.status(404).render('404', { message: 'Place not found' });
    }

    // Nearby places (existing logic) — e.g. same district or same category
    const nearbyPlaces = safeAll.filter(p => p.place_id !== place.place_id && (p.district === place.district || p.category === place.category)).slice(0, 6);

    // Compute nearby hotels safely (only if hotelsList loaded)
    let nearbyHotels = [];
    if (Array.isArray(hotelsList) && hotelsList.length > 0) {
      // Match by district (case-insensitive)
      const pd = (place.district || '').toLowerCase();
      nearbyHotels = hotelsList.filter(h => (h.district || '').toLowerCase() === pd).slice(0, 4);
    }

    return res.render('places/show', { place, nearby: nearbyPlaces, nearbyHotels });
  } catch (err) {
    console.error('Error in GET /places/:id', err);
    return res.status(500).send('Server error');
  }
});


module.exports = router;
