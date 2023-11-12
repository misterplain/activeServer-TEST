const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.get("Authorization");
  console.log("protect middleware accessed");

  if (token) {
    token = token.slice(token.indexOf(" ") + 1);

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_BCN);
      req.user = await User.findById(decoded.id).select("-password");
      next();
      console.log("token verified");
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
      console.log("token not verified", error);
    }
  } else {
    res.status(401);
    console.log("protect middleware token not found");
    throw new Error("No token, authorization denied");
  }

});

module.exports = { protect };
