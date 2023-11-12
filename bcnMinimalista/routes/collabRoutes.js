const express = require("express");
const router = express.Router();
const collabController = require("../controllers/collabController");


router.route("/").post(collabController.sendCollab);

module.exports = router;
