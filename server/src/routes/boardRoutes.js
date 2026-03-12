const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createInvite,
    joinBoard,
} = require("../controllers/boardController");

router.get("/", auth, getBoards);
router.get("/:id", auth, getBoard);
router.post("/", auth, createBoard);
router.put("/:id", auth, updateBoard);
router.delete("/:id", auth, deleteBoard);
router.post("/:id/invites", auth, createInvite);
router.get("/invite/:token", auth, joinBoard);

module.exports = router;