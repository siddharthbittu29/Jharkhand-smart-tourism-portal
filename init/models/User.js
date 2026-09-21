// init/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 200,
    },

    role: {
      type: String,
      enum: [
        "tourist",
        "guide",
        "vendor",
        "admin",
      ],
      default: "tourist",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * One and only one email index.
 *
 * `unique: true` has been removed from the field above,
 * so there is no duplicate index declaration.
 */
userSchema.index(
  { email: 1 },
  {
    unique: true,
    name: "user_email_unique",
  }
);


/*
 * Reuse an already compiled model during development
 * instead of compiling the same model again.
 */
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);