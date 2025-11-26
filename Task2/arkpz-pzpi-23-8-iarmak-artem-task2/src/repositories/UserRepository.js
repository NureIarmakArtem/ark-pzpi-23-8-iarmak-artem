const db = require('../config/db');

class UserRepository {
    async findByLogin(login) {
        const sql = `SELECT * FROM users WHERE login = ?`;
        const [rows] = await db.execute(sql, [login]);
        return rows[0];
    }

    async findById(id) {
        const sql = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    async registerCourier(login, passwordHash, fullName, phone) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [userResult] = await connection.execute(
                `INSERT INTO users (login, password_hash, role) VALUES (?, ?, 'courier')`,
                [login, passwordHash]
            );
            const userId = userResult.insertId;

            await connection.execute(
                `INSERT INTO couriers (user_id, full_name, phone, status) VALUES (?, ?, ?, 'offline')`,
                [userId, fullName, phone]
            );

            await connection.commit();
            return userId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new UserRepository();