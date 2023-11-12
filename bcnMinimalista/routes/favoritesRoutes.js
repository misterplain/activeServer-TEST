const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const {protect} = require("../middleware/authMiddleware");

router.get("/", favoritesController.getAllFavorites);

//protected routes requiring authorization 
// router.use(verifyJWT);
router.use(protect);
router.post("/:blogId", favoritesController.addFavorite);
router.delete("/:blogId", favoritesController.deleteFavorite);

module.exports = router;
