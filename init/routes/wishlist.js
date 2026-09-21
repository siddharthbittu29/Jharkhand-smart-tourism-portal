const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const { verifyToken } = require("../middleware/auth");

/*
|--------------------------------------------------------------------------
| Wishlist Page
|--------------------------------------------------------------------------
*/

router.get("/", verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.render("wishlist/index", {
      title: "My Wishlist",
      wishlist,
      user: req.user,
    });
  } catch (err) {
    console.error("❌ Wishlist page error:", err);

    res.status(500).render("404", {
      title: "Wishlist",
      message: "Unable to load your wishlist right now.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| Check Wishlist Status
|--------------------------------------------------------------------------
|
| Used by destination detail pages to determine whether the current
| destination has already been saved by the logged-in user.
|
*/

router.get("/status/:placeId", verifyToken, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        saved: false,
        message: "Destination ID is required.",
      });
    }

    const savedItem = await Wishlist.findOne({
      userId: req.user.id,
      placeId: String(placeId),
    });

    return res.json({
      success: true,
      saved: Boolean(savedItem),
    });
  } catch (err) {
    console.error("❌ Wishlist status error:", err);

    return res.status(500).json({
      success: false,
      saved: false,
      message: "Unable to check wishlist status.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| Add Destination
|--------------------------------------------------------------------------
*/

router.post("/add", verifyToken, async (req, res) => {
  try {
    const {
      placeId,
      placeName,
      district,
      image,
    } = req.body;

    if (!placeId || !placeName) {
      return res.status(400).json({
        success: false,
        message: "Destination information is incomplete.",
      });
    }

    const existingItem = await Wishlist.findOne({
      userId: req.user.id,
      placeId: String(placeId),
    });

    if (existingItem) {
      return res.json({
        success: true,
        alreadySaved: true,
        message: "Destination is already in your wishlist.",
      });
    }

    await Wishlist.create({
      userId: req.user.id,
      placeId: String(placeId),
      placeName: String(placeName),
      district: district ? String(district) : "",
      image: image ? String(image) : "",
    });

    return res.json({
      success: true,
      alreadySaved: false,
      message: "Added to wishlist.",
    });
  } catch (err) {
    console.error("❌ Wishlist add error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to add destination to wishlist.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| Remove Destination
|--------------------------------------------------------------------------
*/

router.post("/remove/:placeId", verifyToken, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "Destination ID is required.",
      });
    }

    const result = await Wishlist.deleteOne({
      userId: req.user.id,
      placeId: String(placeId),
    });

    if (result.deletedCount === 0) {
      return res.json({
        success: false,
        message: "Destination was not found in your wishlist.",
      });
    }

    return res.json({
      success: true,
      message: "Destination removed from wishlist.",
    });
  } catch (err) {
    console.error("❌ Wishlist remove error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to remove destination.",
    });
  }
});


module.exports = router;