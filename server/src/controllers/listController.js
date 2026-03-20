const List = require("../models/List");
const Board = require("../models/Board");

const createList = async (req, res) => {
    const { name, boardId } = req.body;

    if (!name || !boardId) {
        return res.status(400).json({ error: "Name and boardId are required" });
    }

    const membership = await Board.isMember(boardId, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const position = await List.getMaxPosition(boardId) + 1;
    const list = await List.create({ name, boardId, position });

    res.status(201).json(list);
};

const updateList = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const list = await List.findById(id);
    if (!list) {
        return res.status(404).json({ error: "List not found" });
    }

    const membership = await Board.isMember(list.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const updated = await List.update(id, { name });
    res.json(updated);
};

const deleteList = async (req, res) => {
    const { id } = req.params;

    const list = await List.findById(id);
    if (!list) {
        return res.status(404).josn({ error: "List not found" });
    }

    const membership = await Board.isMember(list.board_id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    await List.delete(id);
    res.json({ message: "List deleted" });
};

module.exports = { createList, updateList, deleteList };