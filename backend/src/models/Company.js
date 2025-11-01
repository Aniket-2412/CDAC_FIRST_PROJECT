const { promisePool } = require('../config/database');

class Company {
    // Create new company profile
    static async create(companyData) {
        const {
            user_id, company_name, company_email, company_phone, website,
            industry, company_size, description, address, city, state, pincode,
            logo_path, contact_person_name, contact_person_designation, contact_person_phone
        } = companyData;

        const [result] = await promisePool.query(
            `INSERT INTO companies (
                user_id, company_name, company_email, company_phone, website,
                industry, company_size, description, address, city, state, pincode,
                logo_path, contact_person_name, contact_person_designation, contact_person_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, company_name, company_email, company_phone, website,
                industry, company_size, description, address, city, state, pincode,
                logo_path, contact_person_name, contact_person_designation, contact_person_phone
            ]
        );

        return result.insertId;
    }

    // Find company by user_id
    static async findByUserId(user_id) {
        const [rows] = await promisePool.query(
            `SELECT c.*, u.email, u.is_active, u.is_verified 
             FROM companies c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.user_id = ?`,
            [user_id]
        );
        return rows[0];
    }

    // Find company by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT c.*, u.email, u.is_active, u.is_verified 
             FROM companies c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update company profile
    static async update(id, companyData) {
        const fields = [];
        const values = [];

        Object.keys(companyData).forEach(key => {
            if (companyData[key] !== undefined && key !== 'user_id') {
                fields.push(`${key} = ?`);
                values.push(companyData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete company
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM companies WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Verify company
    static async verify(id) {
        const [result] = await promisePool.query(
            'UPDATE companies SET is_verified = TRUE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get all companies with filters and pagination
    static async getAll(filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT c.*, u.email FROM companies c JOIN users u ON c.user_id = u.id WHERE 1=1`;
        const params = [];

        if (filters.industry) {
            query += ' AND c.industry = ?';
            params.push(filters.industry);
        }

        if (filters.company_size) {
            query += ' AND c.company_size = ?';
            params.push(filters.company_size);
        }

        if (filters.is_verified !== undefined) {
            query += ' AND c.is_verified = ?';
            params.push(filters.is_verified);
        }

        if (filters.city) {
            query += ' AND c.city = ?';
            params.push(filters.city);
        }

        query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Search companies by name
    static async searchByName(name, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT c.*, u.email FROM companies c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.company_name LIKE ? 
             ORDER BY c.created_at DESC 
             LIMIT ? OFFSET ?`,
            [`%${name}%`, limit, offset]
        );
        return rows;
    }

    // Get company count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM companies WHERE 1=1';
        const params = [];

        if (filters.industry) {
            query += ' AND industry = ?';
            params.push(filters.industry);
        }

        if (filters.is_verified !== undefined) {
            query += ' AND is_verified = ?';
            params.push(filters.is_verified);
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0].count;
    }

    // Get companies pending verification
    static async getPendingVerification() {
        const [rows] = await promisePool.query(
            `SELECT c.*, u.email FROM companies c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.is_verified = FALSE 
             ORDER BY c.created_at DESC`
        );
        return rows;
    }
}

module.exports = Company;
