const { promisePool } = require('../config/database');

class Job {
    // Create new job posting
    static async create(jobData) {
        const {
            company_id, title, description, requirements, responsibilities,
            job_type, experience_required, salary_min, salary_max, location,
            work_mode, skills_required, qualifications, number_of_openings,
            application_deadline, status
        } = jobData;

        const [result] = await promisePool.query(
            `INSERT INTO jobs (
                company_id, title, description, requirements, responsibilities,
                job_type, experience_required, salary_min, salary_max, location,
                work_mode, skills_required, qualifications, number_of_openings,
                application_deadline, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                company_id, title, description, requirements, responsibilities,
                job_type, experience_required, salary_min, salary_max, location,
                work_mode, skills_required, qualifications, number_of_openings,
                application_deadline, status || 'active'
            ]
        );

        return result.insertId;
    }

    // Find job by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT j.*, c.company_name, c.logo_path, c.industry, c.city as company_city 
             FROM jobs j 
             JOIN companies c ON j.company_id = c.id 
             WHERE j.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update job
    static async update(id, jobData) {
        const fields = [];
        const values = [];

        Object.keys(jobData).forEach(key => {
            if (jobData[key] !== undefined && key !== 'company_id') {
                fields.push(`${key} = ?`);
                values.push(jobData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete job
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM jobs WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get all jobs with filters and pagination
    static async getAll(filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT j.*, c.company_name, c.logo_path, c.industry 
                     FROM jobs j 
                     JOIN companies c ON j.company_id = c.id 
                     WHERE 1=1`;
        const params = [];

        if (filters.company_id) {
            query += ' AND j.company_id = ?';
            params.push(filters.company_id);
        }

        if (filters.job_type) {
            query += ' AND j.job_type = ?';
            params.push(filters.job_type);
        }

        if (filters.work_mode) {
            query += ' AND j.work_mode = ?';
            params.push(filters.work_mode);
        }

        if (filters.status) {
            query += ' AND j.status = ?';
            params.push(filters.status);
        }

        if (filters.location) {
            query += ' AND j.location LIKE ?';
            params.push(`%${filters.location}%`);
        }

        if (filters.min_salary) {
            query += ' AND j.salary_min >= ?';
            params.push(filters.min_salary);
        }

        if (filters.max_salary) {
            query += ' AND j.salary_max <= ?';
            params.push(filters.max_salary);
        }

        query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Search jobs by title or skills
    static async search(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT j.*, c.company_name, c.logo_path, c.industry 
             FROM jobs j 
             JOIN companies c ON j.company_id = c.id 
             WHERE (j.title LIKE ? OR j.skills_required LIKE ? OR j.description LIKE ?)
             AND j.status = 'active'
             ORDER BY j.created_at DESC 
             LIMIT ? OFFSET ?`,
            [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset]
        );
        return rows;
    }

    // Get jobs by company
    static async getByCompany(company_id, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT * FROM jobs 
             WHERE company_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [company_id, limit, offset]
        );
        return rows;
    }

    // Get active jobs
    static async getActive(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT j.*, c.company_name, c.logo_path, c.industry 
             FROM jobs j 
             JOIN companies c ON j.company_id = c.id 
             WHERE j.status = 'active' 
             AND (j.application_deadline IS NULL OR j.application_deadline >= CURDATE())
             ORDER BY j.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    // Get job count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
        const params = [];

        if (filters.company_id) {
            query += ' AND company_id = ?';
            params.push(filters.company_id);
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0].count;
    }

    // Update job status
    static async updateStatus(id, status) {
        const [result] = await promisePool.query(
            'UPDATE jobs SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Job;
