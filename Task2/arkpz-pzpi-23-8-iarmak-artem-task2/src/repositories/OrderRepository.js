const db = require('../config/db');

class OrderRepository {
    async create(clientAddress, coords) {
        const sql = `INSERT INTO orders (client_address, delivery_coords, status) VALUES (?, ?, 'new')`;
        const [result] = await db.execute(sql, [clientAddress, JSON.stringify(coords)]);
        return result.insertId;
    }

    async findAll() {
        const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    async findById(id) {
        const sql = `SELECT * FROM orders WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    async findByCourier(courierId) {
        const sql = `SELECT * FROM orders WHERE courier_id = ? AND status IN ('in_progress', 'new')`;
        const [rows] = await db.execute(sql, [courierId]);
        return rows;
    }

    async assignCourier(orderId, courierId) {
        const sql = `UPDATE orders SET courier_id = ?, status = 'in_progress' WHERE id = ?`;
        const [result] = await db.execute(sql, [courierId, orderId]);
        return result.affectedRows > 0;
    }

    async updateStatus(orderId, status) {
        const sql = `UPDATE orders SET status = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [status, orderId]);
        return result.affectedRows > 0;
    }
}

module.exports = new OrderRepository();