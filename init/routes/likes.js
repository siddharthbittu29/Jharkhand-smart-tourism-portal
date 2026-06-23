// init/routes/likes.js
const { Router } = require('express');
const Like = require('../models/Like');

const router = Router();

// Deterministic base 15k–20.9k per placeId (stable across restarts)
function baseCountFor(id) {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) >>> 0;
  return 15000 + (h % 6000); // 15000..20999
}

// GET /likes?ids=comma,separated,ids  -> initialize missing & return counts
router.get('/', async (req, res) => {
  try {
    const ids = String(req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const out = {};
    await Promise.all(ids.map(async (id) => {
      const base = baseCountFor(id);
      const doc = await Like.findOneAndUpdate(
        { placeId: id },
        { $setOnInsert: { count: base } },
        { new: true, upsert: true }
      );
      out[id] = doc.count;
    }));
    return res.json({ ok: true, counts: out });
  } catch (e) {
    console.error('likes GET error:', e);
    return res.status(500).json({ ok: false });
  }
});

// POST /likes/:id  -> increment by 1 and return new count
router.post('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const base = baseCountFor(id);
    const doc = await Like.findOneAndUpdate(
      { placeId: id },
      { $inc: { count: 1 }, $setOnInsert: { count: base } }, // on insert becomes base+1
      { new: true, upsert: true }
    );
    return res.json({ ok: true, count: doc.count });
  } catch (e) {
    console.error('likes POST error:', e);
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
