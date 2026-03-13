const pool = require("../db");
const { getMaxPosition } = require("./List");

const Card = {
    async findById(id) {
        const { rows } = await pool.query(
            `SELECT c.*, u.name AS creator_name, u.avatar_color AS creator_avatar
            FROM cards c
            JOIN users u ON u.id = c.created_by
            WHERE c.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async findByIdWithComments(id) {
        const { rows: cardRows } = await pool.query(
            `SELECT c.*, u.name AS creator_name, u.avatar_color AS creator_avatar
            FROM cards c
            JOIN users u ON u.id = c.created_by
            WHERE c.id = $1`,
            [id]
        );

        if (!cardRows[0]) return null;

        const { rows: comments } = await pool.query(
            `SELECT cm.*, u.name AS author_name, u.avatar_color AS author_avatar
            FROM comments cm
            JOIN users u ON u.id = cm.author_id
            WHERE cm.card_id =$1
            ORDER BY cm.created_at ASC`,
            [id]
        );

        return { ...cardRows[0], comments };
    },

    async getMaxPosition(listId) {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(position), 0) AS max_pos
            FROM cards WHERE list_id = $1`,
            [listId]
        );
        return parseFloat(rows[0].max_pos);
    },

    async create({ title, description, dueDate, listId, boardId, createdBy, position }) {
        const { rows } = await pool.query(
            `INSERT INTO cards (title, description, due_date, position, list_id, board_id, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [title, description || null, dueDate || null, position, listId, boardId, createdBy]
        );
        return rows[0];
    },

    async update(id, { title, description, dueDate }) {
        const { rows } = await pool.query(
            `UPDATE cards
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                due_date = COALESCE($3, due_date),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *`,
            [title, description, dueDate, id]
        );
        return rows[0] || null;
    },

    async move(id, { listId, position }) {
        const { rows } = await pool.query(
            `UPDATE cards
            SET list_id = $1,
                position = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *`,
            [listId, position, id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        await pool.query("DELETE FROM cards WHERE id = $1", [id]);
    },
}

module.exports = Card;