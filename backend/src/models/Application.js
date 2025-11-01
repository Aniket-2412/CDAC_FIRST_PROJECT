const { promisePool } = require('../config/database');

class Application {
    // Create new application
    static async create(applicationData) {
        const { job_id, student_id, cover_letter, resume_path } = applicationData;

        const [result] = await promisePool.query(
            `INSERT INTO applications (job_id, student_id, cover_letter, resume_path) 
             VALUES (?, ?, ?, ?)`,
            [job_id, student_id, cover_letter, resume_path]
        );

        return result.insertId;
    }

    // Find application by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT a.*, 
                    j.title as job_title, j.job_type, j.location,
                    c.company_name, c.logo_path,
                    s.first_name, s.last_name, s.email as student_email, s.phone, s.cgpa,
                    u.email as user_email
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Check if application exists
    static async exists(job_id, student_id) {
        const [rows] = await promisePool.query(
            'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
            [job_id, student_id]
        );
        return rows.length > 0;
    }

    // Update application
    static async update(id, applicationData) {
        const fields = [];
        const values = [];

        Object.keys(applicationData).forEach(key => {
            if (applicationData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(applicationData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE applications SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Update application status
    static async updateStatus(id, status, reviewed_by = null, notes = null) {
        const [result] = await promisePool.query(
            `UPDATE applications 
             SET status = ?, reviewed_at = NOW(), reviewed_by = ?, notes = ? 
             WHERE id = ?`,
            [status, reviewed_by, notes, id]
        );
        return result.affectedRows > 0;
    }

    // Delete application
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM applications WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get applications by student
    static async getByStudent(student_id, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT a.*, 
                    j.title as job_title, j.job_type, j.location, j.salary_min, j.salary_max,
                    c.company_name, c.logo_path
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC
             LIMIT ? OFFSET ?`,
            [student_id, limit, offset]
        );
        return rows;
    }

    // Get applications by job
    static async getByJob(job_id, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT a.*, 
                    s.first_name, s.last_name, s.phone, s.email as student_email, 
                    s.college_name, s.degree, s.branch, s.cgpa, s.year_of_passing,
                    u.email as user_email
             FROM applications a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC
             LIMIT ? OFFSET ?`,
            [job_id, limit, offset]
        );
        return rows;
    }

    // Get applications by company
    static async getByCompany(company_id, filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT a.*, 
                            j.title as job_title, j.job_type,
                            s.first_name, s.last_name, s.phone, s.email as student_email, s.cgpa,
                            u.email as user_email
                     FROM applications a
                     JOIN jobs j ON a.job_id = j.id
                     JOIN students s ON a.student_id = s.id
                     JOIN users u ON s.user_id = u.id
                     WHERE j.company_id = ?`;
        const params = [company_id];

        if (filters.status) {
            query += ' AND a.status = ?';
            params.push(filters.status);
        }

        if (filters.job_id) {
            query += ' AND a.job_id = ?';
            params.push(filters.job_id);
        }

        query += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Get all applications with filters
    static async getAll(filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT a.*, 
                            j.title as job_title, j.job_type,
                            c.company_name,
                            s.first_name, s.last_name, s.email as student_email
                     FROM applications a
                     JOIN jobs j ON a.job_id = j.id
                     JOIN companies c ON j.company_id = c.id
                     JOIN students s ON a.student_id = s.id
                     WHERE 1=1`;
        const params = [];

        if (filters.status) {
            query += ' AND a.status = ?';
            params.push(filters.status);
        }

        if (filters.job_id) {
            query += ' AND a.job_id = ?';
            params.push(filters.job_id);
        }

        if (filters.student_id) {
            query += ' AND a.student_id = ?';
            params.push(filters.student_id);
        }

        query += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Get application count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM applications WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.job_id) {
            query += ' AND job_id = ?';
            params.push(filters.job_id);
        }

        if (filters.student_id) {
            query += ' AND student_id = ?';
            params.push(filters.student_id);
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0].count;
    }

    // Get application statistics
    static async getStatistics(student_id = null, company_id = null) {
        let query = `SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
                        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                        SUM(CASE WHEN status = 'interview-scheduled' THEN 1 ELSE 0 END) as interview_scheduled,
                        SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END) as selected
                     FROM applications a`;
        const params = [];

        if (student_id) {
            query += ' WHERE a.student_id = ?';
            params.push(student_id);
        } else if (company_id) {
            query += ' JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ?';
            params.push(company_id);
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0];
    }
}

module.exports = Application;
