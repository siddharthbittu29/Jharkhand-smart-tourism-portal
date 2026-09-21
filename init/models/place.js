// ============================================================
// JHARKHAND TOURISM
// PLACE / DESTINATION MODEL
// File: init/models/place.js
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// ECO / SUSTAINABILITY DETAILS
// ============================================================

const ecoSchema = new mongoose.Schema(
  {
    ecoScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    litterIndex: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    communityOwned: {
      type: Boolean,
      default: false
    },

    guidelines: [
      {
        type: String,
        trim: true,
        maxlength: 500
      }
    ]
  },
  {
    _id: false
  }
);


// ============================================================
// CONTACT DETAILS
// ============================================================

const contactSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      maxlength: 40
    },

    whatsapp: {
      type: String,
      trim: true,
      maxlength: 40
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    _id: false
  }
);


// ============================================================
// IMAGE DETAILS
// ============================================================

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 250
    }
  },
  {
    _id: false
  }
);


// ============================================================
// PLACE / DESTINATION
// ============================================================

const placeSchema = new mongoose.Schema(
  {
    /*
     * Application-level destination ID.
     * Example: p001, p002, p003
     */
    place_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 80
    },


    /*
     * Optional slug for clean URLs / future route usage.
     */
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
      index: true
    },


    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },


    district: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true
    },


    category: {
      type: String,
      enum: [
        "Waterfall",
        "Temple",
        "Wildlife",
        "Hill",
        "Historical",
        "Adventure",
        "Museum",
        "Lake",
        "Fort",
        "Caves",
        "Sanctuary",
        "Other"
      ],
      default: "Other",
      trim: true,
      index: true
    },


    // ========================================================
    // DESCRIPTION
    // ========================================================

    /*
     * Main modern description field.
     */
    description: {
      type: String,
      trim: true,
      maxlength: 5000
    },


    /*
     * Legacy / compatibility fields.
     *
     * Existing destination views and older datasets may use
     * these names, so they remain supported.
     */
    short_desc: {
      type: String,
      trim: true,
      maxlength: 600
    },

    long_desc: {
      type: String,
      trim: true,
      maxlength: 5000
    },


    // ========================================================
    // MAP / DESTINATION LINK
    // ========================================================

    /*
     * Existing destination pages use this Google Maps URL.
     */
    google_map: {
      type: String,
      trim: true,
      maxlength: 1000
    },


    // ========================================================
    // PRIMARY IMAGE COMPATIBILITY
    // ========================================================

    /*
     * Existing and newer views may expect a single `image`
     * property. Keep it alongside the richer `images[]` array.
     */
    image: {
      type: String,
      trim: true,
      maxlength: 1200
    },


    // ========================================================
    // DESTINATION INFORMATION
    // ========================================================

    opening_hours: {
      type: String,
      trim: true,
      maxlength: 300
    },

    entry_fees: {
      type: String,
      trim: true,
      maxlength: 300
    },

    best_time: {
      type: String,
      trim: true,
      maxlength: 300
    },


    // ========================================================
    // COORDINATES
    // ========================================================

    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },

      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    },


    // ========================================================
    // RATINGS / POPULARITY
    // ========================================================

    average_rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    popularity_index: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },


    // ========================================================
    // IMAGES
    // ========================================================

    images: {
      type: [imageSchema],
      default: []
    },


    // ========================================================
    // CONTACT
    // ========================================================

    contact: {
      type: contactSchema,
      default: undefined
    },


    // ========================================================
    // ECO INFORMATION
    // ========================================================

    eco: {
      type: ecoSchema,
      default: undefined
    },


    // ========================================================
    // TAGS
    // ========================================================

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 80
      }
    ]
  },
  {
    timestamps: true
  }
);


// ============================================================
// INDEXES
// ============================================================

placeSchema.index({
  district: 1,
  category: 1
});

placeSchema.index({
  popularity_index: -1
});

placeSchema.index({
  average_rating: -1
});


// ============================================================
// NORMALIZE PLACE ID
// ============================================================

placeSchema.pre("validate", function (next) {
  if (this.place_id) {
    this.place_id = String(this.place_id).trim();
  }

  if (this.slug) {
    this.slug = String(this.slug).trim().toLowerCase();
  }

  next();
});


// ============================================================
// MODEL EXPORT
// ============================================================

module.exports =
  mongoose.models.Place ||
  mongoose.model("Place", placeSchema);