const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(commentsController.getAllComments);

//protected routes requiring authorization
// router.use(verifyJWT);
router.use(protect);
router.route("/").post(commentsController.createNewComment);

router
  .route("/:id")
  .delete(commentsController.deleteComment)
  .patch(commentsController.updateComment);

module.exports = router;
