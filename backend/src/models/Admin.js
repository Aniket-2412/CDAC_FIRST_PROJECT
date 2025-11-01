const { promisePool } = require('../config/database');

class Admin {
    // Create new admin profile
    static async create(adminData) {
        const { user_id, first_name, last_name, phone, designation, department } = adminData;

        const [result] = await promisePool.query(
            `INSERT INTO admins (user_id, first_name, last_name, phone, designation, department) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, first_name, last_name, phone, designation, department]
        );

        return result.insertId;
    }

    // Find admin by user_id
    static async findByUserId(user_id) {
        const [rows] = await promisePool.query(
            `SELECT a.*, u.email, u.is_active, u.is_verified 
             FROM admins a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.user_id = ?`,
            [user_id]
        );
        return rows[0];
    }

    // Find admin by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT a.*, u.email, u.is_active, u.is_verified 
             FROM admins a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update admin profile
    static async update(id, adminData) {
        const fields = [];
        const values = [];

        Object.keys(adminData).forEach(key => {
            if (adminData[key] !== undefined && key !== 'user_id') {
                fields.push(`${key} = ?`);
                values.push(adminData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete admin
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM admins WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get all admins
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT a.*, u.email FROM admins a 
             JOIN users u ON a.user_id = u.id 
             ORDER BY a.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    // Get admin count
    static async getCount() {
        const [rows] = await promisePool.query('SELECT COUNT(*) as count FROM admins');
        return rows[0].count;
    }
}

module.exports = Admin;
