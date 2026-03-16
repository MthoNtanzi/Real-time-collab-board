import api from "./api";

const boardService = {
    async getBoards() {
        const { data } = await api.get("/boards");
        return data;
    },

    async getBoard(id) {
        const { data } = await api.get(`/boards/${id}`);
        return data;
    },

    async createBoard({ name, description, backgroundColor }) {
        const { data } = await api.post("/boards", { name, description, backgroundColor });
        return data;
    },

    async updateBoard(id, { name, description, backgroundColor }) {
        const { data } = await api.put(`/boards/${id}`, { name, description, backgroundColor });
        return data;
    },

    async deleteBoard(id) {
        await api.delete(`/boards/${id}`);
    },

    async createInvite(boardId) {
        const { data } = await api.post(`/boards/${boardId}/invites`);
        return data;
    },

    async joinBoard(token) {
        const { data } = await api.get(`/boards/invite/${token}`);
        return data;
    },
};

export default boardService;