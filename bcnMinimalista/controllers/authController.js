const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { roundToNearestMinutesWithOptions } = require("date-fns/fp");

let refreshTokens = [];

// @desc    Auth user & get token
// @route   POST /login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res
      .status(401)
      .json({ message: "Login failed, please check your credentials" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match)
    return res
      .status(401)
      .json({ message: "Login failed, please check your credentials" });

  const accessToken = jwt.sign(
    {
      id: foundUser._id,
      email: foundUser.email,
    },
    process.env.ACCESS_TOKEN_SECRET_BCN,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email, id: foundUser._id },
    process.env.REFRESH_TOKEN_SECRET_BCN,
    { expiresIn: "30d" }
  );

  refreshTokens.push(refreshToken);
  console.log({
    refreshTokens: refreshTokens,
    text: "refresh token array after login",
  });

  // Send accessToken containing username and roles
  res.json({ foundUser, accessToken, refreshToken });
});

// @desc Refresh
// @route GET /users/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  let refreshToken = req.get("Authorization");
  refreshToken = refreshToken.slice(refreshToken.indexOf(" ") + 1);

  if (!refreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ message: "Refresh token not part of array " });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET_BCN,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden " + err });
      err && console.log(err);
      console.log(refreshTokens);
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      const newAccessToken = jwt.sign(
        {
          email: decoded.email,
          id: decoded.id,
        },
        process.env.ACCESS_TOKEN_SECRET_BCN,
        { expiresIn: "60s" }
      );

      const newRefreshToken = jwt.sign(
        {
          email: decoded.email,
          id: decoded.id,
        },
        process.env.REFRESH_TOKEN_SECRET_BCN,
        { expiresIn: "30d" }
      );

      refreshTokens.push(newRefreshToken);

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      console.log({
        refreshTokens: refreshTokens,
        text: "refresh token array after refresh",
      });

      console.log({
        newAccessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      });
    }
  );
};

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

const logout = (req, res) => {
  let refreshToken = req.get("Authorization");
  refreshToken = refreshToken.slice(refreshToken.indexOf(" ") + 1);
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  console.log({
    refreshTokens: refreshTokens,
    text: "refresh token array after logout",
  });
  res.status(200).json("You logged out successfully.");
};

module.exports = { authUser, refresh, registerUser,  logout };
