const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new userModel({ username, email, password });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    // Compare password using user-defined method
    const isCorrect = await user.isPasswordCorrect(password);
    if (!isCorrect) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate JWT token
    const accessToken = user.generateJWT();

    // Set cookie or send token in response
    res.cookie("token", accessToken, { httpOnly: true });

    // Redirect or send success response
    res.redirect("/track");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in.");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
