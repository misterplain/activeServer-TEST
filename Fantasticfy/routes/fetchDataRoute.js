const express = require("express");
const router = express.Router();
const dataController = require("../controllers/fetchDataController");

router.get("/products", dataController.fetchData);


module.exports = router;
