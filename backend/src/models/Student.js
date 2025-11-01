const { promisePool } = require('../config/database');

class Student {
    // Create new student profile
    static async create(studentData) {
        const {
            user_id, first_name, last_name, phone, date_of_birth, gender,
            address, city, state, pincode, college_name, degree, branch,
            year_of_passing, cgpa, skills, resume_path, profile_image,
            linkedin_url, github_url, portfolio_url
        } = studentData;

        const [result] = await promisePool.query(
            `INSERT INTO students (
                user_id, first_name, last_name, phone, date_of_birth, gender,
                address, city, state, pincode, college_name, degree, branch,
                year_of_passing, cgpa, skills, resume_path, profile_image,
                linkedin_url, github_url, portfolio_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, first_name, last_name, phone, date_of_birth, gender,
                address, city, state, pincode, college_name, degree, branch,
                year_of_passing, cgpa, skills, resume_path, profile_image,
                linkedin_url, github_url, portfolio_url
            ]
        );

        return result.insertId;
    }

    // Find student by user_id
    static async findByUserId(user_id) {
        const [rows] = await promisePool.query(
            `SELECT s.*, u.email, u.is_active, u.is_verified 
             FROM students s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.user_id = ?`,
            [user_id]
        );
        return rows[0];
    }

    // Find student by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT s.*, u.email, u.is_active, u.is_verified 
             FROM students s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update student profile
    static async update(id, studentData) {
        const fields = [];
        const values = [];

        Object.keys(studentData).forEach(key => {
            if (studentData[key] !== undefined && key !== 'user_id') {
                fields.push(`${key} = ?`);
                values.push(studentData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete student
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM students WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get all students with filters and pagination
    static async getAll(filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT s.*, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE 1=1`;
        const params = [];

        if (filters.college_name) {
            query += ' AND s.college_name LIKE ?';
            params.push(`%${filters.college_name}%`);
        }

        if (filters.degree) {
            query += ' AND s.degree = ?';
            params.push(filters.degree);
        }

        if (filters.branch) {
            query += ' AND s.branch = ?';
            params.push(filters.branch);
        }

        if (filters.year_of_passing) {
            query += ' AND s.year_of_passing = ?';
            params.push(filters.year_of_passing);
        }

        if (filters.min_cgpa) {
            query += ' AND s.cgpa >= ?';
            params.push(filters.min_cgpa);
        }

        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Search students by skills
    static async searchBySkills(skills, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT s.*, u.email FROM students s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.skills LIKE ? 
             ORDER BY s.created_at DESC 
             LIMIT ? OFFSET ?`,
            [`%${skills}%`, limit, offset]
        );
        return rows;
    }

    // Get student count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM students WHERE 1=1';
        const params = [];

        if (filters.college_name) {
            query += ' AND college_name LIKE ?';
            params.push(`%${filters.college_name}%`);
        }

        if (filters.degree) {
            query += ' AND degree = ?';
            params.push(filters.degree);
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0].count;
    }
}

module.exports = Student;
