const orderRepo = require('../repositories/OrderRepository');

class OrderController {
    
    async _geocodeAddress(address) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
            
            const response = await fetch(url, {
                headers: { 'User-Agent': 'DeliveryApp-StudentProject/1.0' }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error.message);
            return null;
        }
    }

    create = async (req, res) => {
        try {
            let { clientAddress, coords } = req.body;

            if (!coords && clientAddress) {
                console.log(`Шукаємо координати для: ${clientAddress}...`);
                coords = await this._geocodeAddress(clientAddress);
                
                if (!coords) {
                    return res.status(400).json({ error: "Не вдалося знайти координати для цієї адреси. Введіть їх вручну." });
                }
                console.log(`Знайдено: ${coords.lat}, ${coords.lon}`);
            }

            if (!coords) {
                return res.status(400).json({ error: "Необхідно вказати координати або коректну адресу" });
            }

            const id = await orderRepo.create(clientAddress, coords);
            res.status(201).json({ id, message: "Замовлення створено", coords });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async getAll(req, res) {
        try {
            const orders = await orderRepo.findAll();
            res.json(orders);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async getMyOrders(req, res) {
        try {
            const courierId = req.query.courierId;
            if (!courierId) return res.status(400).json({ error: "Потребується courierId " });
            const orders = await orderRepo.findByCourier(courierId);
            res.json(orders);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async getById(req, res) {
        try {
            const order = await orderRepo.findById(req.params.id);
            if (!order) return res.status(404).json({ message: "Замовлення не знайдено" });
            res.json(order);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async assign(req, res) {
        try {
            const success = await orderRepo.assignCourier(req.params.id, req.body.courierId);
            if (!success) return res.status(404).json({ message: "Замовлення не знайдено" });
            res.json({ success: true, message: "Кур'єр призначений" });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async updateStatus(req, res) {
        try {
            const success = await orderRepo.updateStatus(req.params.id, req.body.status);
            if (!success) return res.status(404).json({ message: "Замовлення не знайдено" });
            res.json({ success: true, message: "Статус оновлено" });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}

module.exports = new OrderController();