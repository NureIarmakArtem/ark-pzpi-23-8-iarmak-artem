const userRepo = require('../repositories/UserRepository');
const db = require('../config/db');

class AuthController {
    async login(req, res) {
        try {
            const { login, password } = req.body;
            const user = await userRepo.findByLogin(login);
            
            if (!user || user.password_hash !== password) {
                return res.status(401).json({ message: "Невірний логін або пароль" });
            }

            let userData = { id: user.id, login: user.login, role: user.role };
            
            if (user.role === 'courier') {
                const [courierRows] = await db.execute('SELECT * FROM couriers WHERE user_id = ?', [user.id]);
                if (courierRows.length > 0) {
                    userData.fullName = courierRows[0].full_name;
                    userData.status = courierRows[0].status;
                }
            }

            res.json({
                token: `jwt-token-${user.id}`,
                user: userData
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async register(req, res) {
        try {
            const { login, password, fullName, phone } = req.body;
            const userId = await userRepo.registerCourier(login, password, fullName, phone);
            res.status(201).json({ message: "Кур'єр успішно зареєстрований", userId });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.query.userId; 
            if (!userId) return res.status(400).json({ error: "Потребується userId" });

            const user = await userRepo.findById(userId);
            if (!user) return res.status(404).json({ error: "Користувач не знайдений" });

            const responseData = {
                id: user.id,
                login: user.login,
                role: user.role
            };

            if (user.role === 'courier') {
                const [courierRows] = await db.execute('SELECT * FROM couriers WHERE user_id = ?', [userId]);
                if (courierRows[0]) {
                    responseData.fullName = courierRows[0].full_name;
                    responseData.phone = courierRows[0].phone;
                    responseData.status = courierRows[0].status;
                }
            }

            res.json(responseData);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = new AuthController();