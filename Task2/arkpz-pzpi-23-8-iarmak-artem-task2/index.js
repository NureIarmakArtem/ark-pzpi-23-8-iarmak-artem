const express = require('express');
const cors = require('cors');

const authController = require('./src/controllers/authController');
const orderController = require('./src/controllers/orderController');
const locationController = require('./src/controllers/locationController');
const courierController = require('./src/controllers/courierController');
const routeController = require('./src/controllers/routeController');

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTH ---
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/profile', authController.getProfile); 

// --- ORDERS ---
app.post('/api/orders', orderController.create);
app.get('/api/orders', orderController.getAll);
app.get('/api/orders/my', orderController.getMyOrders); 
app.get('/api/orders/:id', orderController.getById);
app.patch('/api/orders/:id/assign', orderController.assign);
app.patch('/api/orders/:id/status', orderController.updateStatus);

// --- LOCATION & ROUTES ---
app.post('/api/location', locationController.sendLocation);
app.get('/api/location/:id/history', locationController.getHistory);
app.get('/api/routes/:orderId', routeController.getByOrder); 

// --- COURIERS ---
app.get('/api/couriers', courierController.getAll);
app.get('/api/couriers/:id', courierController.getById);
app.patch('/api/couriers/status', courierController.updateStatus);
app.delete('/api/couriers/:id', courierController.delete);

app.listen(3000, () => {
    console.log(`Сервер працює на http://localhost:3000`);
});