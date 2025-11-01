const { promisePool } = require('../config/database');

class Interview {
    // Create new interview
    static async create(interviewData) {
        const {
            application_id, interview_type, interview_mode, scheduled_date,
            scheduled_time, duration_minutes, location, meeting_link,
            interviewer_name, interviewer_email, interviewer_phone, notes
        } = interviewData;

        const [result] = await promisePool.query(
            `INSERT INTO interviews (
                application_id, interview_type, interview_mode, scheduled_date,
                scheduled_time, duration_minutes, location, meeting_link,
                interviewer_name, interviewer_email, interviewer_phone, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                application_id, interview_type, interview_mode, scheduled_date,
                scheduled_time, duration_minutes || 60, location, meeting_link,
                interviewer_name, interviewer_email, interviewer_phone, notes
            ]
        );

        return result.insertId;
    }

    // Find interview by ID
    static async findById(id) {
        const [rows] = await promisePool.query(
            `SELECT i.*, 
                    a.job_id, a.student_id,
                    j.title as job_title, j.job_type,
                    c.company_name, c.logo_path,
                    s.first_name, s.last_name, s.phone as student_phone, s.email as student_email,
                    u.email as user_email
             FROM interviews i
             JOIN applications a ON i.application_id = a.id
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE i.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update interview
    static async update(id, interviewData) {
        const fields = [];
        const values = [];

        Object.keys(interviewData).forEach(key => {
            if (interviewData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(interviewData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await promisePool.query(
            `UPDATE interviews SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Update interview status
    static async updateStatus(id, status) {
        const [result] = await promisePool.query(
            'UPDATE interviews SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Add feedback
    static async addFeedback(id, feedback, rating, result) {
        const [queryResult] = await promisePool.query(
            'UPDATE interviews SET feedback = ?, rating = ?, result = ?, status = ? WHERE id = ?',
            [feedback, rating, result, 'completed', id]
        );
        return queryResult.affectedRows > 0;
    }

    // Delete interview
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM interviews WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get interviews by application
    static async getByApplication(application_id) {
        const [rows] = await promisePool.query(
            `SELECT * FROM interviews 
             WHERE application_id = ? 
             ORDER BY scheduled_date DESC, scheduled_time DESC`,
            [application_id]
        );
        return rows;
    }

    // Get interviews by student
    static async getByStudent(student_id, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await promisePool.query(
            `SELECT i.*, 
                    j.title as job_title, j.job_type,
                    c.company_name, c.logo_path
             FROM interviews i
             JOIN applications a ON i.application_id = a.id
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.student_id = ?
             ORDER BY i.scheduled_date DESC, i.scheduled_time DESC
             LIMIT ? OFFSET ?`,
            [student_id, limit, offset]
        );
        return rows;
    }

    // Get interviews by company
    static async getByCompany(company_id, filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT i.*, 
                            j.title as job_title,
                            s.first_name, s.last_name, s.phone as student_phone, s.email as student_email,
                            u.email as user_email
                     FROM interviews i
                     JOIN applications a ON i.application_id = a.id
                     JOIN jobs j ON a.job_id = j.id
                     JOIN students s ON a.student_id = s.id
                     JOIN users u ON s.user_id = u.id
                     WHERE j.company_id = ?`;
        const params = [company_id];

        if (filters.status) {
            query += ' AND i.status = ?';
            params.push(filters.status);
        }

        if (filters.interview_type) {
            query += ' AND i.interview_type = ?';
            params.push(filters.interview_type);
        }

        if (filters.scheduled_date) {
            query += ' AND i.scheduled_date = ?';
            params.push(filters.scheduled_date);
        }

        query += ' ORDER BY i.scheduled_date DESC, i.scheduled_time DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Get all interviews with filters
    static async getAll(filters = {}, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT i.*, 
                            j.title as job_title,
                            c.company_name,
                            s.first_name, s.last_name, s.email as student_email
                     FROM interviews i
                     JOIN applications a ON i.application_id = a.id
                     JOIN jobs j ON a.job_id = j.id
                     JOIN companies c ON j.company_id = c.id
                     JOIN students s ON a.student_id = s.id
                     WHERE 1=1`;
        const params = [];

        if (filters.status) {
            query += ' AND i.status = ?';
            params.push(filters.status);
        }

        if (filters.interview_type) {
            query += ' AND i.interview_type = ?';
            params.push(filters.interview_type);
        }

        if (filters.scheduled_date) {
            query += ' AND i.scheduled_date = ?';
            params.push(filters.scheduled_date);
        }

        query += ' ORDER BY i.scheduled_date DESC, i.scheduled_time DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Get upcoming interviews
    static async getUpcoming(student_id = null, company_id = null, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query = `SELECT i.*, 
                            j.title as job_title,
                            c.company_name, c.logo_path,
                            s.first_name, s.last_name, s.email as student_email
                     FROM interviews i
                     JOIN applications a ON i.application_id = a.id
                     JOIN jobs j ON a.job_id = j.id
                     JOIN companies c ON j.company_id = c.id
                     JOIN students s ON a.student_id = s.id
                     WHERE i.status = 'scheduled' 
                     AND i.scheduled_date >= CURDATE()`;
        const params = [];

        if (student_id) {
            query += ' AND a.student_id = ?';
            params.push(student_id);
        }

        if (company_id) {
            query += ' AND j.company_id = ?';
            params.push(company_id);
        }

        query += ' ORDER BY i.scheduled_date ASC, i.scheduled_time ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await promisePool.query(query, params);
        return rows;
    }

    // Get interview count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM interviews i';
        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push('i.status = ?');
            params.push(filters.status);
        }

        if (filters.student_id) {
            query += ' JOIN applications a ON i.application_id = a.id';
            conditions.push('a.student_id = ?');
            params.push(filters.student_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await promisePool.query(query, params);
        return rows[0].count;
    }
}

module.exports = Interview;
