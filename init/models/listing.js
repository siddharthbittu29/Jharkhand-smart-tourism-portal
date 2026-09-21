// ============================================================
// JHARKHAND TOURISM
// LISTING MODEL
// File: init/models/listing.js
// ============================================================

const mongoose = require("mongoose");


const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 180
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },

    description: {
      type: String,
      trim: true,
      maxlength: 4000
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    /*
     * Kept as a String because the existing listings view
     * and form use a single image URL.
     */
    image: {
      type: String,
      trim: true,
      maxlength: 1200
    },

    category: {
      type: String,
      enum: [
        "Adventure",
        "Pilgrimage",
        "Nature",
        "City",
        "Heritage",
        "Other"
      ],
      default: "Other",
      trim: true
    }
  },
  {
    timestamps: true
  }
);


/* ============================================================
   INDEXES
   ============================================================ */

listingSchema.index({
  location: 1
});

listingSchema.index({
  category: 1
});

listingSchema.index({
  createdAt: -1
});


/* ============================================================
   MODEL EXPORT
   Prevent model recompilation during development/reload.
   ============================================================ */

module.exports =
  mongoose.models.Listing ||
  mongoose.model("Listing", listingSchema);