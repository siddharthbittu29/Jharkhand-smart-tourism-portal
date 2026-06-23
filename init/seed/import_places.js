// init/seed/import_places.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Place = require('../models/place');

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jk-tourism';
const file = path.join(__dirname, '..', 'data', 'places.json');

async function main() {
  if (!fs.existsSync(file)) {
    console.error('Seed JSON not found:', file);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const list = JSON.parse(raw);

  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', DB_URI);

  let upserted = 0;
  for (const p of list) {
    const query = p.place_id ? { place_id: p.place_id } : { name: p.name };
    // Normalize fields to match schema names if needed
    const doc = {
      place_id: p.place_id,
      name: p.name,
      district: p.district,
      category: p.category,
      description: p.description,
      image: (p.images && p.images[0]) || p.image || '',
      tags: p.tags || [],
      bestSeason: p.best_time ? [p.best_time] : (p.bestSeason || []),
      timeRequiredHrs: p.timeRequiredHrs || p.time_required || undefined,
      entryFeeINR: (typeof p.entry_fees === 'number') ? p.entry_fees : (p.entry_fees && Number(p.entry_fees.replace(/\D/g,''))) || 0,
      average_rating: p.average_rating || p.average_rating,
      popularity_index: p.popularity_index || p.popularity_index || 0,
      coordinates: p.coordinates || p.coords,
      images: p.images || [],
      // eco: ensure structure
      eco: p.eco || { ecoScore: (p.average_rating ? Math.round(p.average_rating * 20) : 50), litterIndex: 0, communityOwned: false, guidelines: p.guidelines || [] }
    };

    // Use updateOne with upsert to avoid duplicates
    const res = await Place.updateOne(query, { $set: doc }, { upsert: true });
    upserted++;
  }

  console.log('Upserted', upserted, 'places.');
  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(2); });
