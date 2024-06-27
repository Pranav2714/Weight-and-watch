const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const User = require("../models/user");

// POST route to handle tracking data
router.post("/", verifyToken, async (req, res) => {
  try {
    const { duration } = req.body;
    const userId = req.user._id;

    // Fetch user progress data from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Calculate progress based on duration
    const progressData = calculateProgress(user, parseInt(duration));

    // Render progress page with data
    res.render("progress", { user: req.user, progressData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching progress data.");
  }
});

// Function to calculate progress based on user data and duration
function calculateProgress(user, duration) {
  const startDate = user.date[0]; // Assuming user.date is an array of dates
  const endDate = user.date[user.date.length - 1]; // Last date in the array
  const totalWeightLost = user.weight[0] - user.weight[user.weight.length - 1]; // Example weight lost calculation

  // Filter user weights based on duration
  const filteredWeights = user.weight.slice(-duration); // Get weights for the last 'duration' days

  // Calculate average weight change
  const averageWeightChange = calculateAverageWeightChange(filteredWeights);

  const progressData = {
    startDate,
    endDate,
    totalWeightLost,
    averageWeightChange,
    // Add more progress metrics as needed
  };
  return progressData;
}

// Function to calculate average weight change
function calculateAverageWeightChange(weights) {
  if (weights.length < 2) return 0; // If less than 2 weights, return 0 or handle as needed

  const initialWeight = weights[0];
  const finalWeight = weights[weights.length - 1];
  const weightChange = initialWeight - finalWeight;

  return weightChange / (weights.length - 1); // Calculate average change excluding initial weight
}

module.exports = router;
