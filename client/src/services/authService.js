import api from "./api";

const authService = {
    async register({ name, email, password }) {
        const { data } = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("token", data.token);
        return data;
    },

    async login({ email, password }) {
        const { data } = await api.post("auth/login", { email, password });
        localStorage.setItem("token", data.token);
        return data;
    },

    async me() {
        const { data } = await api.get("auth/me");
        return data;
    },

    logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    },
};

export default authService;