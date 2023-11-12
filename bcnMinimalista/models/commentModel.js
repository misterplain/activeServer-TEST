const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  {
    collection: "bcnminComments",
  }
);

module.exports = mongoose.model("Comment", commentSchema);
