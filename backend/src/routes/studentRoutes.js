const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { isStudent, isAdmin, isStudentOrAdmin } = require('../middleware/roleCheck');
const { validateStudentProfile, validateId, validatePagination } = require('../middleware/validation');
const { uploadResume, uploadProfileImage, handleUploadError } = require('../middleware/upload');

// Student routes (protected)
router.get('/profile', authenticate, isStudent, StudentController.getProfile);
router.put('/profile', authenticate, isStudent, validateStudentProfile, StudentController.updateProfile);
router.post('/upload-resume', authenticate, isStudent, uploadResume, handleUploadError, StudentController.updateProfile);
router.post('/upload-profile-image', authenticate, isStudent, uploadProfileImage, handleUploadError, StudentController.updateProfile);

// Admin routes
router.get('/', authenticate, isAdmin, validatePagination, StudentController.getAllStudents);
router.get('/search', authenticate, isAdmin, validatePagination, StudentController.searchBySkills);
router.get('/:id', authenticate, isAdmin, validateId, StudentController.getStudentById);
router.delete('/:id', authenticate, isAdmin, validateId, StudentController.deleteStudent);

module.exports = router;
