const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");

// @desc Get all blogs
// @route GET /blogs
// @access Private
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().lean();
  if (!blogs.length) {
    return res.status(400).json({ message: "No blogs found" });
  }
  res.json(blogs);
});

// @desc Create a new blog
// @route PUT /blogs
// @access Private
const addBlog = asyncHandler(async (req, res) => {
  const { img, title, caption, alt, src } = req.body;
  if (!title || !caption || !img || !caption || !alt || !src) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const blogObject = {
    title: title,
    caption: caption,
    img: img,
    caption: caption,
    alt: alt,
    src: src,
  };

  //create and store new blog
  const blog = await Blog.create(blogObject);
  if (blog) {
    res.status(201).json({ message: "Blog created successfully" });
  } else {
    res.status(400).json({ message: "Invalid blog data received" });
  }
});

// @desc delete blog
// @route delete /blogs
// @access Private
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const blog = await Blog.findByIdAndDelete(id).exec();
  if (blog) {
    res.status(201).json({ message: "Blog deleted successfully" });
  } else {
    res.status(400).json({ message: "Invalid blog data received" });
  }
});

module.exports = {
  getAllBlogs,
  addBlog,
  deleteBlog,
};
