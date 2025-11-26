const routeRepo = require('../repositories/RouteRepository');
const orderRepo = require('../repositories/OrderRepository');
    
const RESTAURANT_LOCATION = { lat: 50.005, lon: 36.229 };

class RouteController {
    async getByOrder(req, res) {
        try {
            const orderId = req.params.orderId;

            let route = await routeRepo.getByOrder(orderId);
            if (route) {
                return res.json(route);
            }

            console.log("Маршруту немає, розраховуємо через OSRM...");
            
            const order = await orderRepo.findById(orderId);
            if (!order) return res.status(404).json({ error: "Замовлення не знайдено" });

            const endCoords = typeof order.delivery_coords === 'string' 
                ? JSON.parse(order.delivery_coords) 
                : order.delivery_coords;

            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${RESTAURANT_LOCATION.lon},${RESTAURANT_LOCATION.lat};${endCoords.lon},${endCoords.lat}?overview=full&geometries=geojson`;

            const response = await fetch(osrmUrl);
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
                return res.status(400).json({ error: "Не вдалося побудувати маршрут" });
            }

            const bestRoute = data.routes[0];
            const geometry = bestRoute.geometry;
            const durationMin = Math.round(bestRoute.duration / 60);

            await routeRepo.saveRoute(orderId, geometry, durationMin);

            res.json({
                orderId: orderId,
                pathGeometry: geometry,
                estimatedTime: durationMin,
                source: "OSRM Live Data"
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = new RouteController();