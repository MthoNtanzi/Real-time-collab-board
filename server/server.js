require("dotenv").config();
const http = require("http");
// const { Server } = require("socket.io");
const app = require("./src/app");
// const socketHandler = require("./src/socket/socketHandler");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});