// init/seed/places_seed.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// IMPORTANT: correct path from this file to the model
const Place = require('../models/place');

const outDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// === original base data generation (kept mostly as-is) ===
const base = [
  {
    "place_id": "p001",
    "name": "Netarhat Hills",
    "district": "Latehar",
    "category": "Hill",
    "description": "Netarhat is a scenic hill plateau known for sunrise views, rolling hills, and biodiversity. Explore nature trails, viewpoints and sheltered picnic spots. Ideal for photography, short treks, and seasonal flower displays. Local homestays provide authentic cuisine and lodging. Respect local regulations in fragile areas and follow low-impact travel practices.",
    "opening_hours": "Sunrise–Sunset",
    "entry_fees": "Free",
    "best_time": "Oct–Feb",
    "coordinates": { "lat": 23.6360, "lng": 84.4810 },
    "average_rating": 4.7,
    "popularity_index": 92,
    "images": [
      "/smart/places/images/netarhat-1.jpg",
      "/smart/places/images/netarhat-2.jpg",
      "/smart/places/images/netarhat-3.jpg"
    ]
  }
];

const places = [];
for (let i = 0; i < 25; i++) {
  const idx = i + 1;
  const copy = JSON.parse(JSON.stringify(base[0]));
  copy.place_id = 'p' + String(idx).padStart(3, '0');
  if (idx !== 1) {
    copy.name = `${['Betla','Hundru Falls','Deoghar Shrine','Palamu Fort','Parasnath'][idx % 5]} ${idx}`;
    copy.district = ['Latehar','Palamu','Hazaribagh','Deoghar','Ranchi'][idx % 5];
    copy.category = ['Hill','Wildlife','Waterfall','Temple','Historical'][idx % 5];
    copy.coordinates = { lat: 23.6 + idx * 0.02, lng: 84.48 + idx * 0.03 };
    copy.opening_hours = "9:00–17:00";
    copy.entry_fees = idx % 3 === 0 ? "₹50" : "Free";
    copy.best_time = "Oct–Mar";
    copy.average_rating = +(3.5 + Math.random() * 1.5).toFixed(1);
    copy.popularity_index = Math.floor(40 + Math.random() * 60);
    copy.images = [
      `/smart/places/images/placeholder-${(idx%5)+1}.jpg`,
      `/smart/places/images/placeholder-${(idx%5)+2}.jpg`,
      `/smart/places/images/placeholder-${(idx%5)+3}.jpg`
    ];
  }
  places.push(copy);
}

// write JSON to disk (kept for convenience)
fs.writeFileSync(path.join(outDir, 'places.json'), JSON.stringify(places, null, 2), 'utf8');
console.log('Wrote', places.length, 'places to init/data/places.json');

// === Mongo insertion logic below ===
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jk_tourism';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', MONGO_URI);

    // Convert image string array -> array of { url, caption } to match imageSchema
    const docs = places.map(p => {
      const images = Array.isArray(p.images)
        ? p.images.map(url => ({ url, caption: '' }))
        : [];
      return {
        ...p,
        images
      };
    });

    // delete any existing docs with same place_id
    const ids = docs.map(d => d.place_id);
    await Place.deleteMany({ place_id: { $in: ids } });
    console.log('Removed existing places with same place_id (if any)');

    // insert
    const inserted = await Place.insertMany(docs, { ordered: false });
    console.log(`Inserted ${inserted.length} places into MongoDB successfully!`);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Done.');
    process.exit(0);
  }
}

run();
