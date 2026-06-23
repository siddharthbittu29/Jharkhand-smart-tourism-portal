const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const { verifyToken } = require("../middleware/auth");

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { placeId, placeName, district, image } = req.body;

    const exists = await Wishlist.findOne({
      userId: req.user.id,
      placeId,
    });

    if (!exists) {
      await Wishlist.create({
        userId: req.user.id,
        placeId,
        placeName,
        district,
        image,
      });
    }

    res.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;