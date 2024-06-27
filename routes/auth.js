// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user.");
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    // Compare password
    const isCorrect = await user.isPasswordCorrect(password);
    if (!isCorrect) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate JWT token
    const accessToken = user.generateJWT();

    // Set cookie and send token in response
    res.cookie("token", accessToken, { httpOnly: true });

    // Redirect to tracking page
    res.redirect("/track");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in.");
  }
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
