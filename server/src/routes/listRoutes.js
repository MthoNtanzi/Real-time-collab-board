const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createList, updateList, deleteList } = require("../controllers/listController");

router.post("/", auth, createList);
router.put("/:id", auth, updateList);
router.delete("/:id", auth, deleteList);

module.exports = router;