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
    const progressData = calculateProgress(user, duration);

    // Render progress page with data
    res.render("progress", { user: req.user, progressData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching progress data.");
  }
});

function calculateProgress(user, duration) {
  // Extract dates and weights
  let dateArray = user.date;
  let weightArray = user.weight;

  // Combine dates and weights into a single array of objects
  let dataArray = [];
  for (let i = 0; i < dateArray.length; i++) {
    dataArray.push({ date: dateArray[i], weight: weightArray[i] });
  }

  // Sort the data array by date in descending order
  dataArray.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate total weight change
  let totalChange =
    dataArray[0].weight - dataArray[dataArray.length - 1].weight;

  // Determine the number of days to include in the filtered data
  let numberOfDays = Math.min(Number(duration), dataArray.length);

  // Filter the data for the requested duration
  let xValues = [];
  let yValues = [];
  for (let i = 0; i < numberOfDays; i++) {
    xValues.push(dataArray[i].date);
    yValues.push(dataArray[i].weight);
  }

  // Reverse the arrays to have the earliest dates first
  xValues.reverse();
  yValues.reverse();

  // Transform dates to the desired format (MM-DD)
  xValues = xValues.map((date) => date.toISOString().substring(5, 10));

  // Calculate average weight change
  const averageWeightChange = calculateAverageWeightChange(yValues);
  console.log(totalChange);
  // Return the progress data
  return {
    startDate: dateArray[0],
    endDate: dateArray[dateArray.length - 1],
    totalChange,
    averageWeightChange,
    xValues,
    yValues,
    yV: JSON.stringify(yValues),
    xV: JSON.stringify(xValues),
  };
}

// Function to calculate average weight change
function calculateAverageWeightChange(weights) {
  if (weights.length < 2) return 0; // If less than 2 weights, return 0 or handle as needed

  const initialWeight = weights[0];
  const finalWeight = weights[weights.length - 1];
  const weightChange = finalWeight - initialWeight;

  return weightChange / (weights.length - 1); // Calculate average change excluding initial weight
}

module.exports = router;
