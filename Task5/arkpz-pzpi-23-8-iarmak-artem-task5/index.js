const express = require('express');
const cors = require('cors');

const authMid = require('./src/middleware/authMiddleware');
const authCon = require('./src/controllers/authController');
const orderCon = require('./src/controllers/orderController');
const locCon = require('./src/controllers/locationController');
const courCon = require('./src/controllers/courierController');
const routeCon = require('./src/controllers/routeController');
const adminCon = require('./src/controllers/adminController');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', authCon.login);

const adminOnly = authMid(['admin']);

app.post('/api/auth/register', adminOnly, authCon.register);
app.get('/api/auth/profile', adminOnly, authCon.getProfile); 
app.get('/api/couriers', adminOnly, courCon.getAll);
app.get('/api/couriers/:id', adminOnly, courCon.getById);
app.delete('/api/couriers/:id', adminOnly, courCon.delete);

app.post('/api/orders', adminOnly, orderCon.create);
app.get('/api/orders', adminOnly, orderCon.getAll);
app.patch('/api/orders/:id/assign', adminOnly, orderCon.assign);

app.get('/api/admin/stats', adminOnly, adminCon.getSystemStats);
app.get('/api/admin/export', adminOnly, adminCon.exportData);
app.post('/api/admin/backup', adminOnly, adminCon.createBackup);
app.get('/api/location/:id/history', adminOnly, locCon.getHistory);

const courierOnly = authMid(['courier']);

app.get('/api/orders/my', courierOnly, orderCon.getMyOrders);
app.post('/api/location', courierOnly, locCon.sendLocation);
const bothRoles = authMid(['admin', 'courier']);

app.get('/api/orders/:id', bothRoles, orderCon.getById);
app.get('/api/routes/:orderId', bothRoles, routeCon.getByOrder);
app.patch('/api/orders/:id/status', bothRoles, orderCon.updateStatus);
app.patch('/api/couriers/status', bothRoles, courCon.updateStatus);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});