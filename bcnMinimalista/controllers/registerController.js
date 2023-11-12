const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// @desc Create a new user
// @route POST /register
// @access Private
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const duplicate = await User.findOne({ email: email }).lean().exec();
  if (duplicate) {
    return res
      .status(400)
      .json({ message: "User already exists, please try another email" });
  }
  const userObject = {
    username: username,
    password: password,
    email: email,
  };

  // create and store new user
  const user = await User.create(userObject);
  if (user) {
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET_BCN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET_BCN,
      { expiresIn: "7d" }
    );

    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: "None", //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });

    // Send accessToken containing username and roles
    res.json({ accessToken, refreshToken });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

module.exports = { registerUser };
