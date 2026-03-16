import { create } from "zustand";
import authService from "../services/authService";
import { connectSocket, disconnectSocket } from "../socket/socketClient";

const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    error: null,

    register: async ({ name, email, password }) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.register({ name, email, password });
            set({ user: data.user, isLoading: false });
            connectSocket();
        } catch (err) {
            set({ error: err.response?.data?.error || "Registration failed", isLoading: false });
        }
    },

    login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.login({ email, password });
            set({ user: data.user, isLoading: false });
            connectSocket();
        } catch (err) {
            set({ error: err.response?.data?.error || "Login failed", isLoading: false });
        }
    },

    logout: () => {
        authService.logout();
        disconnectSocket();
        set({ user: null, error: null });
    },

    initAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await authService.me();
            set({ user, isLoading: false });
            connectSocket();
        } catch {
            set({ user: null, isLoading: false });
        }
    },
}));

export default useAuthStore;