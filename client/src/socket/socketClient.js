import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
    return socket;
}

export function connectSocket() {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (socket && socket.connected) return;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        autoConnect: true,
        forceNew: true,
        transports: ["websocket"],
    });
    // Debug connection errors
    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    socket.on("connect", () => {
        console.info("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
    });
}

export function disconnectSocket() {
    if (socket && socket.connected) socket.disconnect();
    socket = null;
}

