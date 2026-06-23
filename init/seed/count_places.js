// init/seed/count_places.js
const mongoose = require('mongoose');
const Place = require('../models/place');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jk_tourism';

async function run(){
  await mongoose.connect(MONGO_URI);
  const c = await Place.countDocuments();
  console.log('places count =', c);
  const one = await Place.findOne().lean();
  console.log('example doc:', one && { place_id: one.place_id, name: one.name });
  await mongoose.disconnect();
}
run();
