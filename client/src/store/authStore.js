import { create } from "zustand";
import authService from "../services/authService";
import { connectSocket, disconnectSocket } from "../socket/socketClient";

const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    error: null,

    initAuth: async () => {
        set({ isLoading: true });
        const user = await authService.me();
        if (user) connectSocket();
        set({ user, isLoading: false });
    },

    login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        const data = await authService.login({ email, password });
        if (!data) {
            set({ error: "Invalid credentials", isLoading: false });
            return null;
        }
        set({ user: data.user, isLoading: false });
        connectSocket();
        return data.user;
    },

    register: async ({ name, email, password }) => {
        set({ isLoading: true, error: null });
        const data = await authService.register({ name, email, password });
        if (!data) {
            set({ error: "Registration failed", isLoading: false });
            return null;
        }
        set({ user: data.user, isLoading: false });
        connectSocket();
        return data.user;
    },

    logout: () => {
        authService.logout();
        disconnectSocket();
        set({ user: null, error: null });
    },
}));

export default useAuthStore;