const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt_decode = require("jwt-decode");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

const getUserDetails = asyncHandler(async (req, res) => {
  console.log("getUserDetails accessed");
    res.json(req.user);

});

// @desc update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, email } = req.body;

  //confirm data
  if (!username || !email || !id) {
    return res.status(400).json({
      message: `Please fill in all fields ${username} ${email} ${id}`,
    });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //check for duplicate
  const duplicate = await User.findOne({ email: email }).lean().exec();
  //allow updates to the original user
  if (duplicate && duplicate?._id.toString() != id) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  user.username = username;
  user.email = email;

  if (password) {
    //hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `User ${updatedUser.username} updated successfully` });
});

// @desc Delete user
// @route Delete /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `User ${result.username} with ID ${result.id}deleted successfully`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
};
