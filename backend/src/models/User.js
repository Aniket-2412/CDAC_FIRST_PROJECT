const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        const { email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await promisePool.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );
        
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await promisePool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            'SELECT id, email, role, is_active, is_verified, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Update user
    static async update(id, userData) {
        const fields = [];
        const values = [];

        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete user
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await promisePool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    // Set verification token
    static async setVerificationToken(id, token) {
        const [result] = await promisePool.query(
            'UPDATE users SET verification_token = ? WHERE id = ?',
            [token, id]
        );
        return result.affectedRows > 0;
    }

    // Verify user
    static async verifyUser(token) {
        const [result] = await promisePool.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?',
            [token]
        );
        return result.affectedRows > 0;
    }

    // Get all users with pagination
    static async getAll(page = 1, limit = 10, role = null) {
        const offset = (page - 1) * limit;
        let query = 'SELECT id, email, role, is_active, is_verified, created_at FROM users';
        const params = [];

        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }
}

module.exports = User;
