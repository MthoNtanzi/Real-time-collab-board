import api from "./api";

const cardService = {
    async createCard({ title, listId, boardId, description, dueDate }) {
        const { data } = await api.post("/cards", { title, listId, boardId, description, dueDate });
        return data;
    },

    async getCard(id) {
        const { data } = await api.get(`/cards/${id}`);
        return data;
    },

    async updateCard(id, { title, description, dueDate }) {
        const { data } = await api.put(`/cards/${id}`, { title, description, dueDate });
        return data;
    },

    async moveCard(id, { listId, position }) {
        const { data } = await api.patch(`/cards/${id}/move`, { listId, position });
        return data;
    },

    async deleteCard(id) {
        await api.delete(`/cards/${id}`);
    },
};

export default cardService;