const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createComment, deleteComment } = require("../controllers/commentController");

router.post("/cards/:cardId/comments", auth, createComment);
router.delete("/comments/:id", auth, deleteComment);

module.exports = router;