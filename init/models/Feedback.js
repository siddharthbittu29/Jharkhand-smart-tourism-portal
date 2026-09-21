// ============================================================
// JHARKHAND TOURISM
// FEEDBACK MODEL
// File: init/models/Feedback.js
// ============================================================

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 160
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },

    nationality: {
      type: String,
      trim: true,
      maxlength: 60
    },

    category: {
      type: String,
      trim: true,
      maxlength: 60
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 3000
    },

    /*
     * Rating remains part of the data model, but it is no longer
     * mandatory for every feedback submission.
     *
     * This keeps the model compatible with the current contact/
     * feedback form while preserving the existing 1–5 scale.
     */
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Rating must be a whole number between 1 and 5."
      }
    },

    rewardCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 40,
      index: true
    },

    rewardTier: {
      type: String,
      enum: ["BRONZE", "SILVER", "GOLD"],
      default: "BRONZE"
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    ip: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  {
    timestamps: true
  }
);


/* ============================================================
   INDEXES
   ============================================================ */

FeedbackSchema.index({
  createdAt: -1
});


/* ============================================================
   MODEL EXPORT
   Prevent model recompilation during development/reload.
   ============================================================ */

module.exports =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);