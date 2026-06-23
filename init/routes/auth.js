const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "JharkhandTourism2026SecureKey";

/*
=================================
REGISTER PAGE
=================================
*/

router.get("/register", (req, res) => {
  res.render("auth/register", {
    layout: "layout-auth",
    title: "Create Account"
  });
});

/*
=================================
LOGIN PAGE
=================================
*/
router.get("/login", (req, res) => {
  res.render("auth/login", {
    layout: "layout-auth",
    title: "Login"
  });
});

/*
=================================
REGISTER USER
=================================
*/

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "tourist",
    });

    await newUser.save();

    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration Failed");
  }
});

/*
=================================
LOGIN USER
=================================
*/

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("Invalid Email");
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.send("Invalid Password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Login Failed");
  }
});

/*
=================================
LOGOUT
=================================
*/

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;