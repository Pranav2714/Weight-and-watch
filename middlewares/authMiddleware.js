const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const secret = process.env.JWT_SECRET;

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(403).send("No token provided.");
    }

    const decodedToken = await jwt.verify(token, secret);
    const user = await userModel.findById(decodedToken.id);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    req.user = user; // Attach user object to request object
    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to authenticate token.");
  }
};
