// init/routes/listings.js
const { Router } = require('express');

// Try to load Place model; if missing, use a safe mock that returns empty results
let Place;
try {
  Place = require('../models/Place');
} catch (e) {
  console.warn('⚠️ Place model not found. /listings will render with empty data.');
  Place = {
    find: () => ({
      select() { return this; },
      sort() { return this; },
      skip() { return this; },
      limit() { return this; },
      lean: async () => [],
    }),
    countDocuments: async () => 0,
  };
}

const router = Router();

// helpers
const PAGE_SIZE_DEFAULT = 9;
const num = (v, d) => {
  const x = parseInt(v, 10);
  return Number.isFinite(x) && x > 0 ? x : d;
};
const s = (v) => (typeof v === 'string' ? v.trim() : '');

const buildQuery = ({ q, category, district, minRating }) => {
  const query = {};
  if (q) query.$text = { $search: q };     // will be ignored if no text index
  if (category) query.category = category;
  if (district) query.district = district;
  if (minRating) query.rating = { $gte: Number(minRating) || 0 };
  return query;
};

const buildSort = (sort, hasQ) => {
  if (hasQ) return { score: { $meta: 'textScore' } };
  switch (sort) {
    case 'recent':  return { createdAt: -1 };
    case 'popular': return { views: -1, rating: -1 };
    case 'rating':  return { rating: -1, name: 1 };
    case 'name':    return { name: 1 };
    default:        return { name: 1 };
  }
};

// HTML
router.get('/', async (req, res, next) => {
  try {
    const q          = s(req.query.q);
    const category   = s(req.query.category);
    const district   = s(req.query.district);
    const minRating  = s(req.query.minRating);
    const sort       = s(req.query.sort);
    const page       = Math.max(num(req.query.page, 1), 1);
    const limit      = Math.min(num(req.query.limit, PAGE_SIZE_DEFAULT), 48);

    const query      = buildQuery({ q, category, district, minRating });
    let cursor       = Place.find(query);
    if (q) cursor     = cursor.select({ score: { $meta: 'textScore' } });

    const total      = await Place.countDocuments(query);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const skip       = (page - 1) * limit;
    const sortSpec   = buildSort(sort, !!q);

    const docs       = await cursor.sort(sortSpec).skip(skip).limit(limit).lean();

    res.render('listings', {
      places: docs,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
      filters: { q, category, district, minRating, sort: sort || (q ? 'relevance' : 'name') }
    });
  } catch (err) {
    next(err);
  }
});

// JSON (optional)
router.get('/api', async (req, res, next) => {
  try {
    const q          = s(req.query.q);
    const category   = s(req.query.category);
    const district   = s(req.query.district);
    const minRating  = s(req.query.minRating);
    const sort       = s(req.query.sort);
    const page       = Math.max(num(req.query.page, 1), 1);
    const limit      = Math.min(num(req.query.limit, PAGE_SIZE_DEFAULT), 48);

    const query      = buildQuery({ q, category, district, minRating });
    let cursor       = Place.find(query);
    if (q) cursor     = cursor.select({ score: { $meta: 'textScore' } });

    const total      = await Place.countDocuments(query);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const skip       = (page - 1) * limit;
    const sortSpec   = buildSort(sort, !!q);

    const docs       = await cursor.sort(sortSpec).skip(skip).limit(limit).lean();

    res.json({
      places: docs,
      pagination: { page, limit, total, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
      filters: { q, category, district, minRating, sort: sort || (q ? 'relevance' : 'name') }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
