const mongoose = require('mongoose');

const ecoSchema = new mongoose.Schema({
  ecoScore: { type: Number, min: 0, max: 100, required: true },
  litterIndex: { type: Number, min: 0, max: 100, default: 0 },
  communityOwned: { type: Boolean, default: false },
  guidelines: [{ type: String }]
}, { _id: false });

const contactSchema = new mongoose.Schema({
  phone: String,
  whatsapp: String,
  website: String
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: String,
  caption: String
}, { _id: false });

const placeSchema = new mongoose.Schema({
  place_id: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: [
      'Waterfall','Temple','Wildlife','Hill','Historical','Adventure',
      'Museum','Lake','Fort','Caves','Sanctuary','Other'
    ],
    default: 'Other'
  },
  description: { type: String, trim: true },
  opening_hours: { type: String },
  entry_fees: { type: String },
  best_time: { type: String },
  coordinates: {
    lat: { type: Number }, lng: { type: Number }
  },
  average_rating: { type: Number, min: 0, max: 5, default: 0 },
  popularity_index: { type: Number, min: 0, max: 100, default: 0 },
  images: [imageSchema],
  contact: contactSchema,
  eco: { type: ecoSchema, required: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);


