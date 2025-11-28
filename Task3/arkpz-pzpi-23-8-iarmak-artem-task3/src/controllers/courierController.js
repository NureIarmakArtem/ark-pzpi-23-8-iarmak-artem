const db = require('../config/db');

class CourierController {
    async getAll(req, res) {
        try {
            const [rows] = await db.execute(`SELECT u.id, u.login, c.full_name, c.status FROM users u JOIN couriers c ON u.id = c.user_id`);
            res.json(rows);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async getById(req, res) {
        try {
            const [rows] = await db.execute(`SELECT * FROM couriers WHERE user_id = ?`, [req.params.id]);
            if (!rows[0]) return res.status(404).json({ message: "Не знайдено" });
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
            const [active] = await db.execute("SELECT * FROM orders WHERE courier_id = ? AND status = 'in_progress'", [req.params.id]);
            if (active.length > 0) return res.status(400).json({ message: "Видалення неможливе: Активні замовлення!" });
            await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}
module.exports = new CourierController();