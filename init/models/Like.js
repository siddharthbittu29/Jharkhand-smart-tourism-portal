// init/models/Like.js
const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  placeId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Like || mongoose.model('Like', LikeSchema);
