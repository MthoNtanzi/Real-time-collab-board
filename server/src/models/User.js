const pool = require("../db");

const User = {
    async findByEmail(email) {
        const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return rows[0] || null;
    },
    async findById(id) {
        const { rows } = await pool.query(
            `SELECT id, email, avatar_color, created_at FROM users WHERE id = $1`, [id]
        );
        return rows[0] || null;
    },
    async create({ name, email, passwordHash }) {
        const { rows } = await pool.query(
            `insert into users (name, email, password_hash) 
            VALUES ($1, $2, $3)
            RETURNING id, name, email, avatar_color, created_at`,
            [name, email, passwordHash]
        );
        return rows[0]
    },
};

module.exports = User;