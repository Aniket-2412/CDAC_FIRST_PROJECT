const Company = require('../models/Company');
const { successResponse, errorResponse, createPaginationResponse } = require('../utils/helpers');

class CompanyController {
    // Get company profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const company = await Company.findByUserId(userId);

            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            return successResponse(res, 200, 'Profile retrieved successfully', company);
        } catch (error) {
            console.error('Get company profile error:', error);
            return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
        }
    }

    // Update company profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Get company
            const company = await Company.findByUserId(userId);
            if (!company) {
                return errorResponse(res, 404, 'Company profile not found');
            }

            // Handle logo upload
            if (req.file) {
                updateData.logo_path = req.file.path;
            }

            // Update profile
            const success = await Company.update(company.id, updateData);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update profile');
            }

            // Get updated profile
            const updatedCompany = await Company.findById(company.id);

            return successResponse(res, 200, 'Profile updated successfully', updatedCompany);
        } catch (error) {
            console.error('Update company profile error:', error);
            return errorResponse(res, 500, 'Failed to update profile', error.message);
        }
    }

    // Get all companies
    static async getAllCompanies(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const companies = await Company.getAll(filters, parseInt(page), parseInt(limit));
            const total = await Company.getCount(filters);

            const response = createPaginationResponse(companies, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Companies retrieved successfully', response);
        } catch (error) {
            console.error('Get all companies error:', error);
            return errorResponse(res, 500, 'Failed to retrieve companies', error.message);
        }
    }

    // Get company by ID
    static async getCompanyById(req, res) {
        try {
            const { id } = req.params;

            const company = await Company.findById(id);
            if (!company) {
                return errorResponse(res, 404, 'Company not found');
            }

            return successResponse(res, 200, 'Company retrieved successfully', company);
        } catch (error) {
            console.error('Get company by ID error:', error);
            return errorResponse(res, 500, 'Failed to retrieve company', error.message);
        }
    }

    // Search companies by name
    static async searchByName(req, res) {
        try {
            const { name, page = 1, limit = 10 } = req.query;

            if (!name) {
                return errorResponse(res, 400, 'Name parameter is required');
            }

            const companies = await Company.searchByName(name, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Companies retrieved successfully', companies);
        } catch (error) {
            console.error('Search companies error:', error);
            return errorResponse(res, 500, 'Failed to search companies', error.message);
        }
    }

    // Verify company (admin only)
    static async verifyCompany(req, res) {
        try {
            const { id } = req.params;

            const success = await Company.verify(id);
            if (!success) {
                return errorResponse(res, 404, 'Company not found');
            }

            return successResponse(res, 200, 'Company verified successfully');
        } catch (error) {
            console.error('Verify company error:', error);
            return errorResponse(res, 500, 'Failed to verify company', error.message);
        }
    }

    // Get pending verifications (admin only)
    static async getPendingVerifications(req, res) {
        try {
            const companies = await Company.getPendingVerification();

            return successResponse(res, 200, 'Pending verifications retrieved successfully', companies);
        } catch (error) {
            console.error('Get pending verifications error:', error);
            return errorResponse(res, 500, 'Failed to retrieve pending verifications', error.message);
        }
    }

    // Delete company (admin only)
    static async deleteCompany(req, res) {
        try {
            const { id } = req.params;

            const success = await Company.delete(id);
            if (!success) {
                return errorResponse(res, 404, 'Company not found');
            }

            return successResponse(res, 200, 'Company deleted successfully');
        } catch (error) {
            console.error('Delete company error:', error);
            return errorResponse(res, 500, 'Failed to delete company', error.message);
        }
    }
}

module.exports = CompanyController;
