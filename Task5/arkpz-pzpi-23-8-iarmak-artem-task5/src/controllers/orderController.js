const orderRepo = require('../repositories/OrderRepository');
const db = require('../config/db');

class OrderController {
    _getDist(lat1, lon1, lat2, lon2) {
        const R = 6371e3; 
        const dLat = (lat2 - lat1) * Math.PI/180, dLon = (lon2 - lon1) * Math.PI/180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    async _geocodeAddress(address) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
            const res = await fetch(url, { headers: { 'User-Agent': 'StudentProject/1.0' } });
            const data = await res.json();
            return (data[0]) ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
        } catch { return null; }
    }

    create = async (req, res) => {
        try {
            let { clientAddress, coords } = req.body;
            if (!coords && clientAddress) coords = await this._geocodeAddress(clientAddress);
            if (!coords) return res.status(400).json({ error: "Адреса не знайдена" });
            const id = await orderRepo.create(clientAddress, coords);
            res.status(201).json({ id, message: "Замовлення створено", coords });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    getAll = async (req, res) => {
        try {
            const orders = await orderRepo.findAll();
            res.json(orders);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    getMyOrders = async (req, res) => {
        try {
            const courierId = req.query.courierId;
            if (!courierId) return res.status(400).json({ error: "courierId неіснує" });
            const orders = await orderRepo.findByCourier(courierId);
            res.json(orders);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    getById = async (req, res) => {
        try {
            const order = await orderRepo.findById(req.params.id);
            if (!order) return res.status(404).json({ message: "Замовлення не знайдено" });
            res.json(order);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    assign = async (req, res) => {
        try {
            const orderId = req.params.id;
            const { courierId } = req.body;

            const order = await orderRepo.findById(orderId);
            if (!order || order.status !== 'new') return res.status(400).json({ message: "Замовлення не доступне" });

            const [c] = await db.execute('SELECT status FROM couriers WHERE user_id = ?', [courierId]);
            if (!c[0]) return res.status(404).json({ message: "Кур'єр не знайдений" });
            if (c[0].status === 'offline') return res.status(400).json({ message: "Кур'єр Offline" });

            const active = await orderRepo.countActiveOrders(courierId);
            if (active >= 1) return res.status(400).json({ error: "BUSY", message: "Кур'єр вже має активне замовлення" });

            await orderRepo.assignCourier(orderId, courierId);
            res.json({ success: true, message: "Кур'єр призначений" });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    updateStatus = async (req, res) => {
        try {
            const orderId = req.params.id;
            const { status, courierLat, courierLon } = req.body;

            if (status === 'completed') {
                const order = await orderRepo.findById(orderId);
                if (!courierLat) return res.status(400).json({ error: "NO_GPS" });
                
                let dest = order.delivery_coords;
                if (typeof dest === 'string') dest = JSON.parse(dest);
                const dist = this._getDist(courierLat, courierLon, dest.lat, dest.lon);
                
                if (dist > 500) return res.status(400).json({ error: "TOO_FAR", message: `Далеко (${Math.round(dist)}m)` });
            }

            await orderRepo.updateStatus(orderId, status);
            res.json({ success: true, status });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}
module.exports = new OrderController();