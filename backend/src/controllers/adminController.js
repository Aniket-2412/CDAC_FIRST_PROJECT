const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { successResponse, errorResponse } = require('../utils/helpers');

class AdminController {
    // Get admin profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const admin = await Admin.findByUserId(userId);

            if (!admin) {
                return errorResponse(res, 404, 'Admin profile not found');
            }

            return successResponse(res, 200, 'Profile retrieved successfully', admin);
        } catch (error) {
            console.error('Get admin profile error:', error);
            return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
        }
    }

    // Update admin profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const admin = await Admin.findByUserId(userId);
            if (!admin) {
                return errorResponse(res, 404, 'Admin profile not found');
            }

            const success = await Admin.update(admin.id, updateData);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update profile');
            }

            const updatedAdmin = await Admin.findById(admin.id);

            return successResponse(res, 200, 'Profile updated successfully', updatedAdmin);
        } catch (error) {
            console.error('Update admin profile error:', error);
            return errorResponse(res, 500, 'Failed to update profile', error.message);
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            const studentCount = await Student.getCount();
            const companyCount = await Company.getCount();
            const jobCount = await Job.getCount();
            const applicationCount = await Application.getCount();
            const applicationStats = await Application.getStatistics();

            const stats = {
                students: studentCount,
                companies: companyCount,
                jobs: jobCount,
                applications: applicationCount,
                applicationBreakdown: applicationStats
            };

            return successResponse(res, 200, 'Dashboard statistics retrieved successfully', stats);
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return errorResponse(res, 500, 'Failed to retrieve statistics', error.message);
        }
    }

    // Get all users
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, role } = req.query;

            const users = await User.getAll(parseInt(page), parseInt(limit), role);

            return successResponse(res, 200, 'Users retrieved successfully', users);
        } catch (error) {
            console.error('Get all users error:', error);
            return errorResponse(res, 500, 'Failed to retrieve users', error.message);
        }
    }

    // Activate/Deactivate user
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            const success = await User.update(id, { is_active });
            if (!success) {
                return errorResponse(res, 404, 'User not found');
            }

            return successResponse(res, 200, `User ${is_active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Toggle user status error:', error);
            return errorResponse(res, 500, 'Failed to update user status', error.message);
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const success = await User.delete(id);
            if (!success) {
                return errorResponse(res, 404, 'User not found');
            }

            return successResponse(res, 200, 'User deleted successfully');
        } catch (error) {
            console.error('Delete user error:', error);
            return errorResponse(res, 500, 'Failed to delete user', error.message);
        }
    }
}

module.exports = AdminController;
