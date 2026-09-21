// init/models/Like.js

const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    placeId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },

    count: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Like count must be an integer.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// No additional placeId index here.
// `unique: true` already creates the required index.

module.exports =
  mongoose.models.Like ||
  mongoose.model("Like", LikeSchema);