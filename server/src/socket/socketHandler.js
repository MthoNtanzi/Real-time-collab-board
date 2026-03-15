const boardEvents = require("./boardEvents");

module.exports = function socketHandler(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error("Authentication error"))
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        boardEvents(io, socket);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
        });
    });
};