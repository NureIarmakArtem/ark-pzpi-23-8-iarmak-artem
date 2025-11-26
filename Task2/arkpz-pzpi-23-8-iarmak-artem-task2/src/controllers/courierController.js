const db = require('../config/db');

class CourierController {
    async getAll(req, res) {
        try {
            const sql = `
                SELECT u.id, u.login, c.full_name, c.phone, c.status 
                FROM users u 
                JOIN couriers c ON u.id = c.user_id
            `;
            const [rows] = await db.execute(sql);
            res.json(rows);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async getById(req, res) {
        try {
            const sql = `SELECT * FROM couriers WHERE user_id = ?`;
            const [rows] = await db.execute(sql, [req.params.id]);
            if (!rows[0]) return res.status(404).json({ message: "Кур'єр не знайдений" });
            res.json(rows[0]);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async updateStatus(req, res) {
        try {
            const { courierId, status } = req.body;
            await db.execute('UPDATE couriers SET status = ? WHERE user_id = ?', [status, courierId]);
            res.json({ success: true, status });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async delete(req, res) {
        try {
            await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
            res.json({ success: true, message: "Видалено" });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}
module.exports = new CourierController();