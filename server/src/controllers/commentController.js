const Comment = require("../models/Comment");
const Card = require("../models/Card");
const Board = require("../models/Board");

const createComment = async (req, res) => {
    const { cardId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
        return res.status(400).json({ error: "Comment body is required" });
    }

    const card = await Card.findById(cardId);
    if (!card) {
        return res.status(404).json({ error: "Card not found" });
    }

    const membership = await Board.isMember(card.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const comment = await Comment.create({
        body: body.trim(),
        cardId,
        authorId: req.user.id,
    });

    res.status(201).json(comment);
};

const deleteComment = async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author_id !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own comments" });
    }

    await Comment.delete(id);
    res.json({ message: "Comment deleted" });
};

module.exports = { createComment, deleteComment };