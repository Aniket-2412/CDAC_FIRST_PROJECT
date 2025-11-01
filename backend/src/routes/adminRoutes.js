const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateId, validatePagination } = require('../middleware/validation');

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Admin profile routes
router.get('/profile', AdminController.getProfile);
router.put('/profile', AdminController.updateProfile);

// Dashboard and statistics
router.get('/dashboard/stats', AdminController.getDashboardStats);

// User management
router.get('/users', validatePagination, AdminController.getAllUsers);
router.put('/users/:id/toggle-status', validateId, AdminController.toggleUserStatus);
router.delete('/users/:id', validateId, AdminController.deleteUser);

module.exports = router;
