const Application = require('../models/Application');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { successResponse, errorResponse, createPaginationResponse } = require('../utils/helpers');
const NotificationService = require('../services/notificationService');

class ApplicationController {
    // Submit application
    static async submitApplication(req, res) {
        try {
            const userId = req.user.id;
            const { job_id, cover_letter } = req.body;

            // Get student
            const student = await Student.findByUserId(userId);
            if (!student) {
                return errorResponse(res, 404, 'Student profile not found');
            }

            // Get job
            const job = await Job.findById(job_id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            if (job.status !== 'active') {
                return errorResponse(res, 400, 'This job is not accepting applications');
            }

            // Check if already applied
            const alreadyApplied = await Application.exists(job_id, student.id);
            if (alreadyApplied) {
                return errorResponse(res, 400, 'You have already applied for this job');
            }

            // Handle resume upload
            let resume_path = student.resume_path;
            if (req.file) {
                resume_path = req.file.path;
            }

            // Create application
            const applicationId = await Application.create({
                job_id,
                student_id: student.id,
                cover_letter,
                resume_path
            });

            // Get created application
            const application = await Application.findById(applicationId);

            // Send confirmation email
            await NotificationService.sendNotification(['email'], {
                type: 'application-confirmation',
                email: student.email,
                studentName: `${student.first_name} ${student.last_name}`,
                jobTitle: job.title,
                companyName: job.company_name
            });

            return successResponse(res, 201, 'Application submitted successfully', application);
        } catch (error) {
            console.error('Submit application error:', error);
            return errorResponse(res, 500, 'Failed to submit application', error.message);
        }
    }

    // Get application by ID
    static async getApplicationById(req, res) {
        try {
            const { id } = req.params;

            const application = await Application.findById(id);
            if (!application) {
                return errorResponse(res, 404, 'Application not found');
            }

            return successResponse(res, 200, 'Application retrieved successfully', application);
        } catch (error) {
            console.error('Get application by ID error:', error);
            return errorResponse(res, 500, 'Failed to retrieve application', error.message);
        }
    }

    // Get student's applications
    static async getStudentApplications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            // Get student
            const student = await Student.findByUserId(userId);
            if (!student) {
                return errorResponse(res, 404, 'Student profile not found');
            }

            const applications = await Application.getByStudent(student.id, parseInt(page), parseInt(limit));
            const total = await Application.getCount({ student_id: student.id });

            const response = createPaginationResponse(applications, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Applications retrieved successfully', response);
        } catch (error) {
            console.error('Get student applications error:', error);
            return errorResponse(res, 500, 'Failed to retrieve applications', error.message);
        }
    }

    // Get applications for a job
    static async getJobApplications(req, res) {
        try {
            const { job_id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const userId = req.user.id;

            // Get job
            const job = await Job.findById(job_id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            // Check permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company || job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to view applications for this job');
                }
            }

            const applications = await Application.getByJob(job_id, parseInt(page), parseInt(limit));
            const total = await Application.getCount({ job_id });

            const response = createPaginationResponse(applications, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Applications retrieved successfully', response);
        } catch (error) {
            console.error('Get job applications error:', error);
            return errorResponse(res, 500, 'Failed to retrieve applications', error.message);
        }
    }

    // Get company's applications
    static async getCompanyApplications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, ...filters } = req.query;

            // Get company
            const company = await Company.findByUserId(userId);
            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            const applications = await Application.getByCompany(company.id, filters, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Applications retrieved successfully', applications);
        } catch (error) {
            console.error('Get company applications error:', error);
            return errorResponse(res, 500, 'Failed to retrieve applications', error.message);
        }
    }

    // Get all applications (admin only)
    static async getAllApplications(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const applications = await Application.getAll(filters, parseInt(page), parseInt(limit));
            const total = await Application.getCount(filters);

            const response = createPaginationResponse(applications, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Applications retrieved successfully', response);
        } catch (error) {
            console.error('Get all applications error:', error);
            return errorResponse(res, 500, 'Failed to retrieve applications', error.message);
        }
    }

    // Update application status
    static async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const userId = req.user.id;

            // Get application
            const application = await Application.findById(id);
            if (!application) {
                return errorResponse(res, 404, 'Application not found');
            }

            // Check permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company) {
                    return errorResponse(res, 404, 'Company profile not found');
                }
                
                const job = await Job.findById(application.job_id);
                if (job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to update this application');
                }
            }

            // Update status
            const success = await Application.updateStatus(id, status, userId, notes);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update application status');
            }

            // Send notification to student
            const student = await Student.findById(application.student_id);
            const job = await Job.findById(application.job_id);
            
            await NotificationService.notifyApplicationStatus(student, job, status);

            return successResponse(res, 200, 'Application status updated successfully');
        } catch (error) {
            console.error('Update application status error:', error);
            return errorResponse(res, 500, 'Failed to update application status', error.message);
        }
    }

    // Withdraw application
    static async withdrawApplication(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get application
            const application = await Application.findById(id);
            if (!application) {
                return errorResponse(res, 404, 'Application not found');
            }

            // Check if user owns this application
            const student = await Student.findByUserId(userId);
            if (!student || application.student_id !== student.id) {
                return errorResponse(res, 403, 'You do not have permission to withdraw this application');
            }

            // Update status to withdrawn
            const success = await Application.updateStatus(id, 'withdrawn', userId);
            if (!success) {
                return errorResponse(res, 400, 'Failed to withdraw application');
            }

            return successResponse(res, 200, 'Application withdrawn successfully');
        } catch (error) {
            console.error('Withdraw application error:', error);
            return errorResponse(res, 500, 'Failed to withdraw application', error.message);
        }
    }

    // Delete application (admin only)
    static async deleteApplication(req, res) {
        try {
            const { id } = req.params;

            const success = await Application.delete(id);
            if (!success) {
                return errorResponse(res, 404, 'Application not found');
            }

            return successResponse(res, 200, 'Application deleted successfully');
        } catch (error) {
            console.error('Delete application error:', error);
            return errorResponse(res, 500, 'Failed to delete application', error.message);
        }
    }

    // Get application statistics
    static async getApplicationStatistics(req, res) {
        try {
            const userId = req.user.id;
            let studentId = null;
            let companyId = null;

            if (req.user.role === 'student') {
                const student = await Student.findByUserId(userId);
                if (student) studentId = student.id;
            } else if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (company) companyId = company.id;
            }

            const statistics = await Application.getStatistics(studentId, companyId);

            return successResponse(res, 200, 'Statistics retrieved successfully', statistics);
        } catch (error) {
            console.error('Get application statistics error:', error);
            return errorResponse(res, 500, 'Failed to retrieve statistics', error.message);
        }
    }
}

module.exports = ApplicationController;
