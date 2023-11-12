const Comment = require("../models/commentModel");
const User = require("../models/userModel");

// @desc Get all notes
// @route GET /comments
// @access Private
const getAllComments = async (req, res) => {
  // Get all notes from MongoDB
  const comments = await Comment.find().lean().sort({ createdAt: -1 });

  // If no comemnts
  if (!comments?.length) {
    return res.status(400).json({ message: "No comments found" });
  }
  res.json(comments);
};

// @desc Create new coimment
// @route POST /comments
// @access Private
const createNewComment = async (req, res) => {
  const { comment } = req.body;
  console.log(comment);
  const { id, username } = req.user;


  // Confirm data
  if (!comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create and store the new user
  const newComment = await Comment.create({ username, comment, createdBy: id });
  console.log(newComment);

  if (newComment) {
    // Created
    return res.status(201).json({ newComment });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateComment = async (req, res) => {
  // console.log("update comment controller accessed");
  const { id } = req.params;
  const { comment } = req.body;
  // console.log(id);

  // Confirm data
  if (!comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  const commentToUpdate = await Comment.findById(id).exec();

  if (!commentToUpdate) {
    return res.status(400).json({ message: "Note not found" });
  }

  commentToUpdate.comment = comment;

  const updatedComment = await commentToUpdate.save();

  res.json({ updatedComment });
};

// @desc Delete a comment
// @route DELETE /comments
// @access Private
const deleteComment = async (req, res) => {
  console.log(req.params);
  // console.log(CommentId)
  // console.log(id);
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  // Confirm note exists to delete
  const comment = await Comment.findById(id).exec();

  if (!comment) {
    return res.status(400).json({ message: "Note not found" });
  }

  const deletedComment = await comment.deleteOne();

  const reply = `Comment '${deletedComment.comment}' with ID ${deletedComment._id} deleted`;
  console.log(reply);
  res.json({ id: deletedComment._id, message: reply });
};

module.exports = {
  getAllComments,
  createNewComment,
  updateComment,
  deleteComment,
};
