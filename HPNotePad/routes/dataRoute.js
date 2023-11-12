const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.post("/", dataController.fetchData);
router.get("/:date", dataController.getDataByDate);
router.delete("/delete", dataController.deleteAllData);

module.exports = router;
