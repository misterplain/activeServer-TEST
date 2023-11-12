const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect)

router.post("/", authController.logout);

module.exports = router;