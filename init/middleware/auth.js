const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "JharkhandTourism2026SecureKey";
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/auth/login");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.redirect("/auth/login");
  }
};

const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).send("Access Denied");
    }

    next();
  } catch (err) {
    return res.status(403).send("Access Denied");
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};