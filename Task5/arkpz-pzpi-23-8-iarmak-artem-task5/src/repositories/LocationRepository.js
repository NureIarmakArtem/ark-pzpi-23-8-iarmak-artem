const db = require('../config/db');

class LocationRepository {
    async addLog(courierId, coords) {
        const sql = `INSERT INTO location_logs (courier_id, coordinates) VALUES (?, ?)`;
        const [result] = await db.execute(sql, [courierId, JSON.stringify(coords)]);
        return result.insertId;
    }

    async getTrackByTime(courierId, startTime, endTime) {
        const sql = `
            SELECT coordinates, timestamp 
            FROM location_logs 
            WHERE courier_id = ? 
            AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC
        `;
        const [rows] = await db.execute(sql, [courierId, startTime, endTime]);
        
        return rows.map(row => ({
            timestamp: row.timestamp,
            coords: row.coordinates
        }));
    }
}

module.exports = new LocationRepository();