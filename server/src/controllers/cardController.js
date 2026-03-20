const Card = require("../models/Card");
const Board = require("../models/Board");
const List = require("../models/List");

const createCard = async (req, res) => {
    const { title, listId, boardId, description, dueDate } = req.body;

    if (!title || !listId || !boardId) {
        return res.status(400).json({ error: "Title, listId and boardId are required" })
    }

    const membership = await Board.isMember(boardId, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const list = await List.findById(listId);
    if (!list) {
        return res.status(404).json({ error: "List not found" });
    }

    const position = await Card.getMaxPosition(listId) + 1;
    const card = await Card.create({
        title,
        description,
        dueDate,
        listId,
        boardId,
        position,
        createdBy: req.user.id,
    });

    res.status(201).json(card);
};

const getCard = async (req, res, next) => {
    try {
        const { id } = req.params;

        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        const membership = await Board.isMember(card.board_id, req.user.id);
        if (!membership) {
            return res.status(403).json({ error: "Access denied" });
        }

        const cardWithComments = await Card.findByIdWithComments(id);
        res.json(cardWithComments);
    } catch (err) {
        next(err);
    }
};

const updateCard = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const card = await Card.findById(id);
    if (!card) {
        return res.status(404).json({ error: "Card not found" });
    }

    const membership = await Board.isMember(card.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const updated = await Card.update(id, { title, description, dueDate });
    res.json(updated);
};

const deleteCard = async (req, res) => {
    const { id } = req.params;

    const card = await Card.findById(id);
    if (!card) {
        return res.status(404).json({ error: "Card not found" });
    }

    const membership = await Board.isMember(card.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    await Card.delete(id);
    res.json({ message: "Card deleted" });
};

const moveCard = async (req, res) => {
    const { id } = req.params;
    const { listId, position } = req.body;

    if (!listId || position === undefined) {
        return res.status(400).json({ error: "listId and position are required" });
    }

    const card = await Card.findById(id);
    if (!card) {
        return res.status(404).json({ error: "Card not found" });
    }

    const membership = await Board.isMember(card.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const list = await List.findById(listId);
    if (!list || list.board_id !== card.board_id) {
        return res.status(400).json({ error: "Invalid list" });
    }

    const moved = await Card.move(id, { listId, position });
    res.json(moved);
};

module.exports = { createCard, getCard, updateCard, deleteCard, moveCard };