const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const userModel = require("../models/user");

// GET route to display tracking form or dashboard
router.get("/", verifyToken, (req, res) => {
  // Assuming you want to display a form or dashboard for tracking
  res.render("track", { user: req.user, dataAdded: req.query.dataAdded }); // Pass authenticated user data and dataAdded flag to the view
});

// POST route to handle adding new tracking data
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, weight } = req.body;
    const userId = req.user._id;

    // Find the user by ID and update tracking data
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Push new tracking data to user's arrays
    user.date.push(date);
    user.weight.push(weight);
    await user.save();

    // Redirect to track page or dashboard with success message
    res.redirect("/track?dataAdded=1"); // Redirect with query parameter to indicate success
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding tracking data.");
  }
});

module.exports = router;
