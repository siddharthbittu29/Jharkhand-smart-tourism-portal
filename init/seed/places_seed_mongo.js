// init/seed/places_seed_mongo.js
const mongoose = require('mongoose');
const data = require('../data/places_data');
const Place = require('../models/place'); // your existing model

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jk_tourism';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Mongo:', MONGO_URI);

    // normalize and insert
    const docs = data.map(d => ({
      place_id: d.place_id,
      name: d.name,
      district: d.district,
      category: d.category,
      description: d.long_desc || d.short_desc,
      // store images as array of objects as per your model imageSchema
      images: (d.image ? [{ url: d.image, caption: '' }] : []),
      // coordinates not available -> left undefined
      google_map: d.google_map || '',
      createdAt: new Date()
    }));

    // Remove existing with same place_ids to avoid duplicates
    const ids = docs.map(x => x.place_id);
    await Place.deleteMany({ place_id: { $in: ids } });
    const inserted = await Place.insertMany(docs, { ordered: false });
    console.log('Inserted', inserted.length, 'places');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

run();
