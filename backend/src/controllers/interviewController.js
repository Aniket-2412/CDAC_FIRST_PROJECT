const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { successResponse, errorResponse, createPaginationResponse } = require('../utils/helpers');
const NotificationService = require('../services/notificationService');

class InterviewController {
    // Schedule interview
    static async scheduleInterview(req, res) {
        try {
            const interviewData = req.body;
            const userId = req.user.id;

            // Get application
            const application = await Application.findById(interviewData.application_id);
            if (!application) {
                return errorResponse(res, 404, 'Application not found');
            }

            // Check if user has permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company) {
                    return errorResponse(res, 404, 'Company profile not found');
                }
                
                const job = await Job.findById(application.job_id);
                if (job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to schedule interview for this application');
                }
            }

            // Create interview
            const interviewId = await Interview.create(interviewData);

            // Update application status
            await Application.updateStatus(interviewData.application_id, 'interview-scheduled', userId);

            // Get created interview
            const interview = await Interview.findById(interviewId);

            // Send notification to student
            const student = await Student.findById(application.student_id);
            const job = await Job.findById(application.job_id);
            
            await NotificationService.notifyInterview(student, job, {
                scheduled_date: interviewData.scheduled_date,
                scheduled_time: interviewData.scheduled_time,
                interview_mode: interviewData.interview_mode,
                location: interviewData.location,
                meeting_link: interviewData.meeting_link
            });

            return successResponse(res, 201, 'Interview scheduled successfully', interview);
        } catch (error) {
            console.error('Schedule interview error:', error);
            return errorResponse(res, 500, 'Failed to schedule interview', error.message);
        }
    }

    // Get interview by ID
    static async getInterviewById(req, res) {
        try {
            const { id } = req.params;

            const interview = await Interview.findById(id);
            if (!interview) {
                return errorResponse(res, 404, 'Interview not found');
            }

            return successResponse(res, 200, 'Interview retrieved successfully', interview);
        } catch (error) {
            console.error('Get interview by ID error:', error);
            return errorResponse(res, 500, 'Failed to retrieve interview', error.message);
        }
    }

    // Get interviews by student
    static async getStudentInterviews(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            // Get student
            const student = await Student.findByUserId(userId);
            if (!student) {
                return errorResponse(res, 404, 'Student profile not found');
            }

            const interviews = await Interview.getByStudent(student.id, parseInt(page), parseInt(limit));
            const total = await Interview.getCount({ student_id: student.id });

            const response = createPaginationResponse(interviews, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Interviews retrieved successfully', response);
        } catch (error) {
            console.error('Get student interviews error:', error);
            return errorResponse(res, 500, 'Failed to retrieve interviews', error.message);
        }
    }

    // Get interviews by company
    static async getCompanyInterviews(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, ...filters } = req.query;

            // Get company
            const company = await Company.findByUserId(userId);
            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            const interviews = await Interview.getByCompany(company.id, filters, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Interviews retrieved successfully', interviews);
        } catch (error) {
            console.error('Get company interviews error:', error);
            return errorResponse(res, 500, 'Failed to retrieve interviews', error.message);
        }
    }

    // Get all interviews (admin only)
    static async getAllInterviews(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const interviews = await Interview.getAll(filters, parseInt(page), parseInt(limit));
            const total = await Interview.getCount(filters);

            const response = createPaginationResponse(interviews, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Interviews retrieved successfully', response);
        } catch (error) {
            console.error('Get all interviews error:', error);
            return errorResponse(res, 500, 'Failed to retrieve interviews', error.message);
        }
    }

    // Get upcoming interviews
    static async getUpcomingInterviews(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            let studentId = null;
            let companyId = null;

            if (req.user.role === 'student') {
                const student = await Student.findByUserId(userId);
                if (student) studentId = student.id;
            } else if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (company) companyId = company.id;
            }

            const interviews = await Interview.getUpcoming(studentId, companyId, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Upcoming interviews retrieved successfully', interviews);
        } catch (error) {
            console.error('Get upcoming interviews error:', error);
            return errorResponse(res, 500, 'Failed to retrieve upcoming interviews', error.message);
        }
    }

    // Update interview
    static async updateInterview(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            // Get interview
            const interview = await Interview.findById(id);
            if (!interview) {
                return errorResponse(res, 404, 'Interview not found');
            }

            // Check permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company) {
                    return errorResponse(res, 404, 'Company profile not found');
                }
                
                const job = await Job.findById(interview.job_id);
                if (job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to update this interview');
                }
            }

            // Update interview
            const success = await Interview.update(id, updateData);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update interview');
            }

            // Get updated interview
            const updatedInterview = await Interview.findById(id);

            return successResponse(res, 200, 'Interview updated successfully', updatedInterview);
        } catch (error) {
            console.error('Update interview error:', error);
            return errorResponse(res, 500, 'Failed to update interview', error.message);
        }
    }

    // Update interview status
    static async updateInterviewStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const success = await Interview.updateStatus(id, status);
            if (!success) {
                return errorResponse(res, 404, 'Interview not found');
            }

            return successResponse(res, 200, 'Interview status updated successfully');
        } catch (error) {
            console.error('Update interview status error:', error);
            return errorResponse(res, 500, 'Failed to update interview status', error.message);
        }
    }

    // Add interview feedback
    static async addFeedback(req, res) {
        try {
            const { id } = req.params;
            const { feedback, rating, result } = req.body;
            const userId = req.user.id;

            // Get interview
            const interview = await Interview.findById(id);
            if (!interview) {
                return errorResponse(res, 404, 'Interview not found');
            }

            // Check permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company) {
                    return errorResponse(res, 404, 'Company profile not found');
                }
                
                const job = await Job.findById(interview.job_id);
                if (job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to add feedback for this interview');
                }
            }

            // Add feedback
            const success = await Interview.addFeedback(id, feedback, rating, result);
            if (!success) {
                return errorResponse(res, 400, 'Failed to add feedback');
            }

            // Update application status based on result
            if (result === 'selected') {
                await Application.updateStatus(interview.application_id, 'selected', userId);
            } else if (result === 'rejected') {
                await Application.updateStatus(interview.application_id, 'rejected', userId);
            }

            return successResponse(res, 200, 'Feedback added successfully');
        } catch (error) {
            console.error('Add feedback error:', error);
            return errorResponse(res, 500, 'Failed to add feedback', error.message);
        }
    }

    // Delete interview
    static async deleteInterview(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get interview
            const interview = await Interview.findById(id);
            if (!interview) {
                return errorResponse(res, 404, 'Interview not found');
            }

            // Check permission (company or admin)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company) {
                    return errorResponse(res, 404, 'Company profile not found');
                }
                
                const job = await Job.findById(interview.job_id);
                if (job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to delete this interview');
                }
            }

            // Delete interview
            const success = await Interview.delete(id);
            if (!success) {
                return errorResponse(res, 400, 'Failed to delete interview');
            }

            return successResponse(res, 200, 'Interview deleted successfully');
        } catch (error) {
            console.error('Delete interview error:', error);
            return errorResponse(res, 500, 'Failed to delete interview', error.message);
        }
    }
}

module.exports = InterviewController;
