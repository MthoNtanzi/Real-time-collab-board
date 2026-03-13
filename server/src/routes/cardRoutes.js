const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    createCard,
    getCard,
    updateCard,
    deleteCard,
    moveCard,
} = require("../controllers/cardController");

router.post("/", auth, createCard);
router.get("/:id", auth, getCard);
router.put("/:id", auth, updateCard);
router.delete("/:id", auth, deleteCard);
router.patch("/:id/move", auth, moveCard);

module.exports = router;