const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

router.post("/", logController.logServerRefresh);

module.exports = router;