import api from "./api";

const listService = {
    async createList({ name, boardId }) {
        const { data } = await api.post("/lists", { name, boardId });
        return data;
    },

    async updateList(id, { name }) {
        const { data } = await api.put(`/lists/${id}`, { name });
        return data;
    },

    async deleteList(id) {
        await api.delete(`/lists/${id}`);
    },
};

export default listService;