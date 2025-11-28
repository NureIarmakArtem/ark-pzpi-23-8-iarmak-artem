const jwt = require('jsonwebtoken');
const SECRET_KEY = 'my_super_secret_key_123';

const authMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (req.method === "OPTIONS") next();

        try {
            const tokenHeader = req.headers.authorization;
            if (!tokenHeader) {
                return res.status(401).json({ message: "Немає токена (Unauthorized)" });
            }

            const token = tokenHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: "Невірний формат токена" });
            }

            const decodedData = jwt.verify(token, SECRET_KEY);
            req.user = decodedData;

            if (decodedData.role === 'admin') {
                return next();
            }
            if (!allowedRoles.includes(decodedData.role)) {
                return res.status(403).json({ message: "Доступ заборонено (Forbidden)" });
            }

            next();
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: "Токен недійсний" });
        }
    };
};

module.exports = authMiddleware;