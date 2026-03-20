const Card = require("../models/Card");

module.exports = function boardEvents(io, socket) {
    socket.on("board:join", (boardId) => {
        socket.join(boardId);

        const rooms = io.sockets.adapter.rooms.get(boardId);
        const memberCount = rooms ? rooms.size : 1;

        console.log(`${socket.user.name} joined ${boardId} ${memberCount} user(s) viewing`);

        io.to(boardId).emit("presence:update", {
            boardId,
            users: Array.from(rooms).map((socketId) => {
                const memberSocket = io.sockets.sockets.get(socketId);
                return memberSocket ? memberSocket.user : null;
            }).filter(Boolean),
        });
    });

    socket.on("board:leave", (boardId) => {
        socket.leave(boardId);

        const rooms = io.sockets.adapter.rooms.get(boardId);

        io.to(boardId).emit("presence:update", {
            boardId,
            users: rooms ? Array.from(rooms).map((socketId) => {
                const memberSocket = io.sockets.sockets.get(socketId);
                return memberSocket ? memberSocket.user : nulll
            }).filter(Boolean) : [],
        });

        console.log(`${socket.user.name} left board ${boardId}`);
    });

    socket.on("card:created", ({ card, boardId }) => {
        socket.to(boardId).emit("card:created", { card, boardId });
    });

    socket.on("card:move", async ({ cardId, listId, position, boardId }) => {
        try {
            const moved = await Card.move(cardId, { listId, position });
            socket.to(boardId).emit("card:moved", {
                cardId,
                listId,
                position,
                boardId,
                movedBy: socket.user,
            });
        } catch (err) {
            console.error("Card move error:", err);
            socket.emit("error", { message: "Failed to move card" });
        }
    });

    socket.on("list:created", ({ list, boardId }) => {
        socket.to(boardId).emit("list:created", { list, boardId });
    });

    socket.on("list:deleted", ({ listId, boardId }) => {
        socket.to(boardId).emit("list:deleted", { listId, boardId });
    });

    socket.on("card:deleted", ({ cardId, listId, boardId }) => {
        socket.to(boardId).emit("card:deleted", { cardId, listId, boardId });
    });

    socket.on("card:updated", ({ card, boardId }) => {
        socket.to(boardId).emit("card:updated", { card, boardId });
    });

    socket.on("comment:created", ({ comment, cardId, boardId }) => {
        socket.to(boardId).emit("comment:created", { comment, cardId, boardId });
    });

    socket.on("comment:deleted", ({ commentId, cardId, boardId }) => {
        socket.to(boardId).emit("comment:deleted", { commentId, cardId, boardId });
    });
}