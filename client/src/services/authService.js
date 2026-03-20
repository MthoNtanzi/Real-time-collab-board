import api from "./api";

const authService = {
    async register({ name, email, password }) {
        try {
            const res = await api.post("/auth/register", { name, email, password });

            const token = res.data?.token || res.data?.data?.token;
            const user = res.data?.user || res.data?.data?.user;

            if (token) localStorage.setItem("token", token);
            return { token, user };
        } catch (err) {
            console.error("Registration failed:", err.response?.data || err.message);
            return null;
        }
    },

    async login({ email, password }) {
        try {
            const res = await api.post("/auth/login", { email, password });

            const token = res.data?.token || res.data?.data?.token;
            const user = res.data?.user || res.data?.data?.user;

            if (token) localStorage.setItem("token", token);
            return { token, user };
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            return null;
        }
    },

    async me() {
        try {
            const res = await api.get("/auth/me");
            return res.data?.user || res.data;
        } catch {
            return null;
        }
    },

    logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    },
};

export default authService;