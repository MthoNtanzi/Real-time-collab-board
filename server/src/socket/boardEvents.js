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

    socket.on("card:move", async ({ cardId, listId, position, boardId }) => {
        try {
            const moved = await Card.move(cardId, { listId, position });

            io.to(boardId).emit("card:moved", {
                cardId,
                listId,
                position,
                boardId,
                movedBy: socket.user,
            });
        } catch (err) {
            socket.emit("error", { message: "Failed to move card" });
        }
    });
}