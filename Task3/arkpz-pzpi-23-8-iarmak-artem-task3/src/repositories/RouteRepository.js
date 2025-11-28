const db = require('../config/db');

class RouteRepository {
    async saveRoute(orderId, geometry, estimatedTime) {
        const sql = `INSERT INTO routes (order_id, path_geometry, estimated_time) VALUES (?, ?, ?)`;
        const [result] = await db.execute(sql, [orderId, JSON.stringify(geometry), estimatedTime]);
        return result.insertId;
    }

    async getByOrder(orderId) {
        const sql = `SELECT * FROM routes WHERE order_id = ?`;
        const [rows] = await db.execute(sql, [orderId]);
        return rows[0];
    }
}

module.exports = new RouteRepository();