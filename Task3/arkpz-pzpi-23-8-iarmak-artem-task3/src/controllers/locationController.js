const locRepo = require('../repositories/LocationRepository');

class LocationController {
    async sendLocation(req, res) {
        try {
            const { courierId, lat, lon } = req.body; 
            
            await locRepo.addLog(courierId, { lat, lon });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async getHistory(req, res) {
        try {
            const courierId = req.params.id;
            const { start, end } = req.query;
            const startTime = start || new Date(Date.now() - 86400000);
            const endTime = end || new Date();

            const track = await locRepo.getTrackByTime(courierId, startTime, endTime);
            res.json(track);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = new LocationController();