// ============================================================
// JHARKHAND TOURISM
// WISHLIST MODEL
// File: init/models/Wishlist.js
// ============================================================

const mongoose = require("mongoose");


const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    placeId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true
    },

    placeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },

    district: {
      type: String,
      trim: true,
      maxlength: 120
    },

    image: {
      type: String,
      trim: true,
      maxlength: 1200
    }
  },
  {
    timestamps: true
  }
);


/* ============================================================
   COMPOUND INDEX
   Helps queries such as:
   - all wishlist items for a user
   - checking a user's saved place
   ============================================================ */

wishlistSchema.index({
  userId: 1,
  placeId: 1
});


/* ============================================================
   SORTING INDEX
   Keeps latest wishlist additions easy to retrieve.
   ============================================================ */

wishlistSchema.index({
  userId: 1,
  createdAt: -1
});


/* ============================================================
   MODEL EXPORT
   Prevents model recompilation during development/reload.
   ============================================================ */

module.exports =
  mongoose.models.Wishlist ||
  mongoose.model("Wishlist", wishlistSchema);