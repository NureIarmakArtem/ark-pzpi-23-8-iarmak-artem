const db = require('../config/db');
const fs = require('fs');
const path = require('path');

class AdminController {

    async getSystemStats(req, res) {
        try {
            const [c] = await db.execute('SELECT COUNT(*) as cnt FROM couriers');
            const [a] = await db.execute("SELECT COUNT(*) as cnt FROM orders WHERE status = 'in_progress'");
            const [comp] = await db.execute("SELECT COUNT(*) as cnt FROM orders WHERE status = 'completed'");
            res.json({ couriers: c[0].cnt, activeOrders: a[0].cnt, completed: comp[0].cnt });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    exportData = async (req, res) => {
        try {
            const type = req.query.type;
            let sql = '';
            let filePrefix = 'data';
            let headers = '';

            if (type === 'couriers') {
                filePrefix = 'couriers';
                headers = 'ID;Full Name;Phone;Status;Login\n';
                sql = `SELECT c.user_id, c.full_name, c.phone, c.status, u.login FROM couriers c JOIN users u ON c.user_id = u.id`;
            } else if (type === 'orders') {
                filePrefix = 'orders';
                headers = 'Order ID;Status;Address;Courier;Created At\n'; 
                sql = `SELECT o.id, o.status, o.client_address, c.full_name, o.created_at FROM orders o LEFT JOIN couriers c ON o.courier_id = c.user_id ORDER BY o.created_at DESC`;
            } else {
                return res.status(400).json({ error: "Вкажіть ?type=couriers або ?type=orders" });
            }

            const [rows] = await db.execute(sql);

            let csvContent = headers;
            rows.forEach(row => {
                const values = Object.values(row).map(val => {
                    let safeVal = val ? val.toString().replace(/(\r\n|\n|\r)/gm, " ") : "";
                    return `"${safeVal.replace(/"/g, '""')}"`;
                });
                csvContent += values.join(';') + '\n';
            });

            const fileName = `export_${filePrefix}_${Date.now()}.csv`;
            const dir = path.join(__dirname, '../../exports');
            
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            const filePath = path.join(dir, fileName);

            const BOM = '\uFEFF'; 
            fs.writeFileSync(filePath, BOM + csvContent); 

            console.log(`Файл збережено: ${filePath}`);
            res.download(filePath, fileName);

        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    async createBackup(req, res) {
        try {
            const [users] = await db.execute('SELECT * FROM users');
            const [couriers] = await db.execute('SELECT * FROM couriers');
            const [orders] = await db.execute('SELECT * FROM orders');
            const [routes] = await db.execute('SELECT * FROM routes');
            const [logs] = await db.execute('SELECT * FROM location_logs');
            
            const backupData = {
                timestamp: new Date(),
                data: { users, couriers, orders, routes, location_logs: logs }
            };

            const fileName = `full_backup_${Date.now()}.json`;
            const dir = path.join(__dirname, '../../backups');
            
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(path.join(dir, fileName), JSON.stringify(backupData, null, 2));

            res.json({ message: "Бекап створено", file: fileName });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
}

module.exports = new AdminController();