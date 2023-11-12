const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

const {protect} = require("../middleware/authMiddleware");

router.route("/").get(usersController.getAllUsers);

router.use(protect);
router
  .route("/profile")
  .get(usersController.getUserDetails)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
