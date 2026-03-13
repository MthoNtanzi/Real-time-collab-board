const pool = require("../db");
const { findbyId } = require("./Board");

const List = {
    async findById(id) {
        const { rows } = await pool.query(
            `SELECT * FROM lists WHERE id = $1`,
            [id]
        );

        return rows[0] || null;
    },

    async getMaxPosition(boardId) {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(position), 0) AS max_pos
            FROM lists WHERE board_id = $1`,
            [boardId]
        );
        return parseFloat(rows[0].max_pos);
    },

    async create({ name, boardId, position }) {
        const { rows } = await pool.query(
            `INSERT INTO lists (name, board_id, position)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, boardId, position]
        );
        return rows[0];
    },
    async update(id, { name }) {
        const { rows } = await pool.query(
            `UPDATE lists
            SET name = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [name, id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        await pool.query("DELETE FROM lists WHERE id = $1", [id]);
    },
}

module.exports = List;