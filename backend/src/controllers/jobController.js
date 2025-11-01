const Job = require('../models/Job');
const Company = require('../models/Company');
const { successResponse, errorResponse, createPaginationResponse } = require('../utils/helpers');

class JobController {
    // Create new job posting
    static async createJob(req, res) {
        try {
            const userId = req.user.id;
            const jobData = req.body;

            // Get company
            const company = await Company.findByUserId(userId);
            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            if (!company.is_verified) {
                return errorResponse(res, 403, 'Company must be verified to post jobs');
            }

            // Add company_id to job data
            jobData.company_id = company.id;

            // Create job
            const jobId = await Job.create(jobData);

            // Get created job
            const job = await Job.findById(jobId);

            return successResponse(res, 201, 'Job created successfully', job);
        } catch (error) {
            console.error('Create job error:', error);
            return errorResponse(res, 500, 'Failed to create job', error.message);
        }
    }

    // Get all jobs
    static async getAllJobs(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const jobs = await Job.getAll(filters, parseInt(page), parseInt(limit));
            const total = await Job.getCount(filters);

            const response = createPaginationResponse(jobs, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Jobs retrieved successfully', response);
        } catch (error) {
            console.error('Get all jobs error:', error);
            return errorResponse(res, 500, 'Failed to retrieve jobs', error.message);
        }
    }

    // Get active jobs
    static async getActiveJobs(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const jobs = await Job.getActive(parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Active jobs retrieved successfully', jobs);
        } catch (error) {
            console.error('Get active jobs error:', error);
            return errorResponse(res, 500, 'Failed to retrieve active jobs', error.message);
        }
    }

    // Get job by ID
    static async getJobById(req, res) {
        try {
            const { id } = req.params;

            const job = await Job.findById(id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            return successResponse(res, 200, 'Job retrieved successfully', job);
        } catch (error) {
            console.error('Get job by ID error:', error);
            return errorResponse(res, 500, 'Failed to retrieve job', error.message);
        }
    }

    // Get jobs by company
    static async getJobsByCompany(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            // Get company
            const company = await Company.findByUserId(userId);
            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            const jobs = await Job.getByCompany(company.id, parseInt(page), parseInt(limit));
            const total = await Job.getCount({ company_id: company.id });

            const response = createPaginationResponse(jobs, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Jobs retrieved successfully', response);
        } catch (error) {
            console.error('Get jobs by company error:', error);
            return errorResponse(res, 500, 'Failed to retrieve jobs', error.message);
        }
    }

    // Search jobs
    static async searchJobs(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;

            if (!q) {
                return errorResponse(res, 400, 'Search query is required');
            }

            const jobs = await Job.search(q, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Jobs retrieved successfully', jobs);
        } catch (error) {
            console.error('Search jobs error:', error);
            return errorResponse(res, 500, 'Failed to search jobs', error.message);
        }
    }

    // Update job
    static async updateJob(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            // Get job
            const job = await Job.findById(id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            // Check if user owns this job (for company role)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company || job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to update this job');
                }
            }

            // Update job
            const success = await Job.update(id, updateData);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update job');
            }

            // Get updated job
            const updatedJob = await Job.findById(id);

            return successResponse(res, 200, 'Job updated successfully', updatedJob);
        } catch (error) {
            console.error('Update job error:', error);
            return errorResponse(res, 500, 'Failed to update job', error.message);
        }
    }

    // Update job status
    static async updateJobStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;

            // Get job
            const job = await Job.findById(id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            // Check if user owns this job (for company role)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company || job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to update this job');
                }
            }

            // Update status
            const success = await Job.updateStatus(id, status);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update job status');
            }

            return successResponse(res, 200, 'Job status updated successfully');
        } catch (error) {
            console.error('Update job status error:', error);
            return errorResponse(res, 500, 'Failed to update job status', error.message);
        }
    }

    // Delete job
    static async deleteJob(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get job
            const job = await Job.findById(id);
            if (!job) {
                return errorResponse(res, 404, 'Job not found');
            }

            // Check if user owns this job (for company role)
            if (req.user.role === 'company') {
                const company = await Company.findByUserId(userId);
                if (!company || job.company_id !== company.id) {
                    return errorResponse(res, 403, 'You do not have permission to delete this job');
                }
            }

            // Delete job
            const success = await Job.delete(id);
            if (!success) {
                return errorResponse(res, 400, 'Failed to delete job');
            }

            return successResponse(res, 200, 'Job deleted successfully');
        } catch (error) {
            console.error('Delete job error:', error);
            return errorResponse(res, 500, 'Failed to delete job', error.message);
        }
    }
}

module.exports = JobController;
