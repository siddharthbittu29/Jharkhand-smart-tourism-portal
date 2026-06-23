const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, (req, res) => {
  res.render("dashboard/index", {
    title: "Tourist Dashboard",
    user: req.user
  });
});

module.exports = router;