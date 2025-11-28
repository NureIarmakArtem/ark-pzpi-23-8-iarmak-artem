const userRepo = require('../repositories/UserRepository');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'my_super_secret_key_123'; 

class AuthController {
    async login(req, res) {
        try {
            const { login, password } = req.body;
            const user = await userRepo.findByLogin(login);
            
            if (!user || user.password_hash !== password) {
                return res.status(401).json({ message: "Невірний логін або пароль" });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                SECRET_KEY, 
                { expiresIn: '24h' }
            );

            let userData = { id: user.id, login: user.login, role: user.role };
            if (user.role === 'courier') {
                const [courierRows] = await db.execute('SELECT * FROM couriers WHERE user_id = ?', [user.id]);
                if (courierRows.length > 0) {
                    userData.fullName = courierRows[0].full_name;
                    userData.status = courierRows[0].status;
                }
            }

            res.json({ token, user: userData });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async register(req, res) {
        try {
            const { login, password, fullName, phone } = req.body;
            const userId = await userRepo.registerCourier(login, password, fullName, phone);
            res.status(201).json({ message: "Кур'єр успішно зареєстрований", userId });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async getProfile(req, res) {
        try {
            const userId = req.query.userId || 1; 
            const user = await userRepo.findById(userId);
            if (!user) return res.status(404).json({ error: "Користувач не знайдений" });
            const response = { id: user.id, login: user.login, role: user.role };
            if (user.role === 'courier') {
                const [rows] = await db.execute('SELECT * FROM couriers WHERE user_id = ?', [userId]);
                if (rows[0]) Object.assign(response, rows[0]);
            }
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}

module.exports = new AuthController();