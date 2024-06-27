require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true in production with HTTPS
  })
);

// Connect to MongoDB
connectDB();

// Import routes
const userRoutes = require("./routes/userRoute");
const authRoutes = require("./routes/auth");
const trackRoutes = require("./routes/track");
const progressRoutes = require("./routes/progress");

// Use routes
app.use(userRoutes);
app.use(authRoutes);
app.use("/track", trackRoutes); // Mount trackRoutes under '/track' path
app.use("/progress", progressRoutes); // Mount progressRoutes under '/progress' path

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(3000, () => {
  console.log("Server Listening Successfully on port 3000");
});
