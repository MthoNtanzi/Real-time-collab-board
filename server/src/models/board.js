const pool = require("../db");

const Board = {
    async findAllByUser(userId) {
        const { rows } = await pool.query(
            `SELECT b.*, bm.role
            FROM boards b
            JOIN board_members bm ON bm.board_id = b.id
            WHERE bm.user_id = $1
            ORDER BY b.created_at DESC`,
            [userId]
        );
        return rows;
    },

    async findbyId(id) {
        const { rows } = await pool.query(
            `SELECT b.* bm.role
            FROM boards
            JOIN board_members bm ON bm.board_id = b.id
            WHERE b.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async isMember(boardId, userId) {
        const { rows } = await pool.query(`
            SELECT role FROM board_members
            WHERE board_id = $1 AND user_id = $2`,
            [boardId, userId]
        );
        return rows[0] || null;
    },

    async findIdWithLists(id) {
        const { rows: boardRows } = await pool.query(`
            SELECT * FROM boards WHERE id = $1`,
            [id]
        );
        if (!boardRows[0]) return null;

        const { rows: lists } = await pool.query(`
            SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC`,
            [id]
        );

        const { rows: cards } = await pool.query(`
            SELECT c.*, u.name AS creator_name, u.avatar_color AS creator_avatar
            FROM cards c
            JOIN users u ON u.id = c.created_by
            WHERE c.board_id = $1
            ORDER BY c.position ASC`,
            [id]
        );

        const cardsByList = cards.reduce((acc, card) => {
            if (!acc[card.list_id]) acc[card.list_id] = [];
            acc[card.list_id].push(card);
            return acc;
        }, {});

        return {
            ...boardRows[0],
            lists: lists.map((list) => ({
                ...list,
                cards: cardsByList[list.id] || [],
            })),
        };
    },

    async create({ name, description, backgroundColor, ownerId }) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const { rows } = await client.query(
                `INSERT INTO boards (name, description, background_color, owner_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [name, description || null, backgroundColor || "#0f172a", ownerId]
            );

            const board = rows[0];

            await client.query(`INSERT INTO board_members (board_id, user_id, role)
                VALUES ($1, $2, 'owner')`,
                [board, ownerId]
            );

            await client.query("COMMIT");
            return board
        } catch (err) {
            await client.query("ROLLBACK");
            throw err
        } finally {
            client.release();
        }
    },

    async update(id, { name, description, backgroundColor, }) {
        const { rows } = await pool.query(
            `UPDATE boards
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                background_color = COALESCE($3, background_color),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *`,
            [name, description, backgroundColor, id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        await pool.query("DELETE FROM boards WHERE id = $1", [id]);
    },

    async addMember(boardId, userId) {
        const { rows } = await pool.query(
            `INSERT INTO board_members (board_id, user_id, role)
            VALUES ($1, $2, 'member')
            ON CONFLICT (board_id, user_id) DO NOTHING
            RETURNING *`,
            [boardId, userId]
        );
        return rows[0] || null;
    },

    async createInvite(boardId, userId) {
        const token = require("crypto").randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const { rows } = await pool.query(
            `INSERT INTO board_invites (board_id, token, created_by, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [boardId, token, userId, expiresAt]
        );
        return rows[0];
    },

    async findInvite(token) {
        const { rows } = await pool.query(
            `SELECT * FROM board_invites
            WHERE token = $1
            AND used = FALSE
            AND expires_at > NOW()`,
            [token]
        );
        return rows[0] || null;
    },

    async useInvite(token) {
        await pool.query(
            `UPDATE board_invite SET used = TRUE WHERE token = $1`,
            [token]
        );
    },
};

module.exports = Board;