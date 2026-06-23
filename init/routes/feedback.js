const { Router } = require('express');
const crypto = require('crypto');
const Feedback = require('../models/Feedback');

const router = Router();

// helper: generate readable reward code (e.g., JH-SIL-7F3D9C)
function rewardFor(rating = 3) {
  let tier = 'BRONZE';
  if (rating >= 4 && rating < 5) tier = 'SILVER';
  if (rating >= 5) tier = 'GOLD';
  const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  const code = `JH-${tier.substring(0,3)}-${token}`;
  return { tier, code };
}

// POST /feedback  -> JSON { ok, rewardCode, rewardTier }
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, nationality, category, message, rating } = req.body || {};
    if (!name || !message || !rating) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    const { tier, code } = rewardFor(Number(rating));

    const doc = await Feedback.create({
      name, email, phone, nationality, category, message, rating: Number(rating),
      rewardCode: code, rewardTier: tier,
      userAgent: req.get('user-agent'),
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress
    });

    return res.json({ ok: true, rewardCode: doc.rewardCode, rewardTier: doc.rewardTier });
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
