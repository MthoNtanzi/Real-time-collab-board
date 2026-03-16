import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: {
                token: localStorage.getItem("token"),
            },
            autoConnect: false,
        });
    }
    return socket;
}

export function connectSocket() {
    const socket = getSocket();
    if (!socket.connected) {
        socket.connect();
    }
}

export function disconnectSocket() {
    if (socket && socket.connected) {
        socket.disconnect();
        socket = null;
    }
}