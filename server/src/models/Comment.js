const pool = require("../db");

const Comment = {
    async create({ body, cardId, authorId }) {
        const { rows } = await pool.query(
            `INSERT INTO comments (body, card_id, author_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [body, cardId, authorId]
        );
        return rows[0];
    },

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT * FROM comments WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        await pool.query("DELETE FROM comments WHERE id = $1", [id]);
    },
};

module.exports = Comment;