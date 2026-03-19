const Board = require("../models/Board");

const getBoards = async (req, res) => {
    const boards = await Board.findAllByUser(req.user.id);
    res.json(boards);
};

const getBoard = async (req, res) => {
    const { id } = req.params;

    const membership = await Board.isMember(id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" })
    }

    const board = await Board.findIdWithLists(id);
    if (!board) {
        return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
}

const createBoard = async (req, res) => {
    const { name, description, backgroundColor } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Board name is required" });
    }

    const board = await Board.create({
        name,
        description,
        backgroundColor,
        ownerId: req.user.id,
    });

    res.status(201).json(board);
};

const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { name, description, backgroundColor } = req.body;

    const membership = await Board.isMember(id, req.user.id);
    if (!membership) {
        return res.status(403).json({ error: "Access denied" });
    }

    const board = await Board.update(id, { name, description, backgroundColor });
    if (!board) {
        return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
};

const deleteBoard = async (req, res) => {
    const { id } = req.params;

    const membership = await Board.isMember(id, req.user.id);
    if (!membership || membership.role !== "owner") {
        return res.status(403).json({ error: "Only the board owner can delete it" });
    }

    await Board.delete(id);
    res.json({ message: "Board deleted" });
};

const createInvite = async (req, res) => {
    const { id } = req.params;

    const membership = await Board.isMember(id, req.user.id);

    if (!membership || membership.role !== "owner") {
        return res.status(403).json({ error: "Only the board owner can create invite links" });
    }

    const invite = await Board.createInvite(id, req.user.id);

    res.status(201).json({
        inviteUrl: `${process.env.CLIENT_URL}/invite/${invite.token}`,
        expiresAt: invite.expires_at,
    });
};

const joinBoard = async (req, res) => {
    const { token } = req.params;

    const invite = await Board.findInvite(token);
    if (!invite) {
        return res.status(400).json({ error: "Invite link i invalid or has expired" });
    }

    const existingMembership = await Board.isMember(invite.board_id, req.user.id);
    if (existingMembership) {
        return res.status(409).json({ error: "You are already a member of this board" })
    }

    await Board.addMember(invite.board_id, req.user.id);
    await Board.useInvite(token);

    const board = await Board.findIdWithLists(invite.board_id);

    res.json({ message: "Successfully joined board", board });
}

module.exports = {
    getBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createInvite,
    joinBoard,
}

