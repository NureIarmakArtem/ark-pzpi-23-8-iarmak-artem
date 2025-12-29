const db = require('../config/db');

class LocationController {

    sendLocation = async (req, res) => {
        try {
            const courierId = req.user.id;
            
            let coordsData = req.body.coordinates || req.body;

            const coordsString = JSON.stringify(coordsData);

            const sql = 'INSERT INTO location_logs (courier_id, coordinates) VALUES (?, ?)';
            
            await db.execute(sql, [courierId, coordsString]);

            console.log(`GPS збережено: ${coordsString}`);
            res.status(200).json({ message: "Location saved" });

        } catch (e) {
            console.error("Помилка сервера:", e.message);
            res.status(500).json({ error: e.message });
        }
    }

    getHistory = async (req, res) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM location_logs WHERE courier_id = ? ORDER BY timestamp DESC LIMIT 100', 
                [req.params.id]
            );
            res.json(rows);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}

module.exports = new LocationController();