// CommonJS model for feedback
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  nationality: { type: String, trim: true }, // e.g., India, UK, USA
  category: { type: String, trim: true }, // e.g., Hotel, Transport, Place, Website, Other
  message: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  rewardCode: { type: String, index: true },
  rewardTier: { type: String, enum: ['BRONZE','SILVER','GOLD'], default: 'BRONZE' },
  userAgent: String,
  ip: String
}, { timestamps: true });

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
