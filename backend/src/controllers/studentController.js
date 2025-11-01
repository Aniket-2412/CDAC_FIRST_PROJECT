const Student = require('../models/Student');
const { successResponse, errorResponse, createPaginationResponse } = require('../utils/helpers');

class StudentController {
    // Get student profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const student = await Student.findByUserId(userId);

            if (!student) {
                return errorResponse(res, 404, 'Student profile not found');
            }

            return successResponse(res, 200, 'Profile retrieved successfully', student);
        } catch (error) {
            console.error('Get student profile error:', error);
            return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
        }
    }

    // Update student profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Get student
            const student = await Student.findByUserId(userId);
            if (!student) {
                return errorResponse(res, 404, 'Student profile not found');
            }

            // Handle file uploads
            if (req.file) {
                if (req.file.fieldname === 'resume') {
                    updateData.resume_path = req.file.path;
                } else if (req.file.fieldname === 'profile_image') {
                    updateData.profile_image = req.file.path;
                }
            }

            // Update profile
            const success = await Student.update(student.id, updateData);
            if (!success) {
                return errorResponse(res, 400, 'Failed to update profile');
            }

            // Get updated profile
            const updatedStudent = await Student.findById(student.id);

            return successResponse(res, 200, 'Profile updated successfully', updatedStudent);
        } catch (error) {
            console.error('Update student profile error:', error);
            return errorResponse(res, 500, 'Failed to update profile', error.message);
        }
    }

    // Get all students (admin only)
    static async getAllStudents(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const students = await Student.getAll(filters, parseInt(page), parseInt(limit));
            const total = await Student.getCount(filters);

            const response = createPaginationResponse(students, total, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Students retrieved successfully', response);
        } catch (error) {
            console.error('Get all students error:', error);
            return errorResponse(res, 500, 'Failed to retrieve students', error.message);
        }
    }

    // Get student by ID (admin only)
    static async getStudentById(req, res) {
        try {
            const { id } = req.params;

            const student = await Student.findById(id);
            if (!student) {
                return errorResponse(res, 404, 'Student not found');
            }

            return successResponse(res, 200, 'Student retrieved successfully', student);
        } catch (error) {
            console.error('Get student by ID error:', error);
            return errorResponse(res, 500, 'Failed to retrieve student', error.message);
        }
    }

    // Search students by skills
    static async searchBySkills(req, res) {
        try {
            const { skills, page = 1, limit = 10 } = req.query;

            if (!skills) {
                return errorResponse(res, 400, 'Skills parameter is required');
            }

            const students = await Student.searchBySkills(skills, parseInt(page), parseInt(limit));

            return successResponse(res, 200, 'Students retrieved successfully', students);
        } catch (error) {
            console.error('Search students error:', error);
            return errorResponse(res, 500, 'Failed to search students', error.message);
        }
    }

    // Delete student profile (admin only)
    static async deleteStudent(req, res) {
        try {
            const { id } = req.params;

            const success = await Student.delete(id);
            if (!success) {
                return errorResponse(res, 404, 'Student not found');
            }

            return successResponse(res, 200, 'Student deleted successfully');
        } catch (error) {
            console.error('Delete student error:', error);
            return errorResponse(res, 500, 'Failed to delete student', error.message);
        }
    }
}

module.exports = StudentController;
