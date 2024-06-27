// models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: [Date],
  weight: [Number],
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.isPasswordCorrect = async function (pass) {
  try {
    return await bcrypt.compare(pass, this.password);
  } catch (err) {
    throw err;
  }
};

userSchema.methods.generateJWT = function () {
  const payload = {
    id: this._id,
    username: this.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
