// =========================================================
// JHARKHAND TOURISM — TOURIST DASHBOARD ROUTES
// =========================================================

const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");

// =========================================================
// GET /dashboard
// Tourist dashboard
// =========================================================

router.get("/", verifyToken, async (req, res) => {
  try {
    // -------------------------------------------------------
    // Load the logged-in user's wishlist
    // -------------------------------------------------------

    const wishlist = await Wishlist.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .lean();

    // -------------------------------------------------------
    // Render dashboard
    // -------------------------------------------------------

    res.render("dashboard/index", {
      title: "Tourist Dashboard",

      user: req.user,

      // Complete wishlist data for dashboard UI
      wishlist,

      // Useful for dashboard statistics/cards
      wishlistCount: wishlist.length,

      // Recent saved destinations
      recentWishlist: wishlist.slice(0, 3)
    });

  } catch (error) {
    console.error("❌ Dashboard error:", error);

    // -------------------------------------------------------
    // Keep dashboard accessible even if wishlist loading fails
    // -------------------------------------------------------

    res.render("dashboard/index", {
      title: "Tourist Dashboard",

      user: req.user,

      wishlist: [],

      wishlistCount: 0,

      recentWishlist: []
    });
  }
});

module.exports = router;