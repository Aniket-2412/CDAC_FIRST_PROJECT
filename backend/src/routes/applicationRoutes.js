const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const { isStudent, isCompany, isAdmin, isCompanyOrAdmin } = require('../middleware/roleCheck');
const { validateApplication, validateId, validatePagination } = require('../middleware/validation');
const { uploadResume, handleUploadError } = require('../middleware/upload');

// Student routes
router.post('/', authenticate, isStudent, validateApplication, uploadResume, handleUploadError, ApplicationController.submitApplication);
router.get('/my-applications', authenticate, isStudent, validatePagination, ApplicationController.getStudentApplications);
router.patch('/:id/withdraw', authenticate, isStudent, validateId, ApplicationController.withdrawApplication);
router.get('/statistics', authenticate, isStudent, ApplicationController.getApplicationStatistics);

// Company routes
router.get('/company/applications', authenticate, isCompany, validatePagination, ApplicationController.getCompanyApplications);
router.get('/job/:job_id', authenticate, isCompanyOrAdmin, validatePagination, ApplicationController.getJobApplications);
router.patch('/:id/status', authenticate, isCompanyOrAdmin, validateId, ApplicationController.updateApplicationStatus);

// Admin routes
router.get('/', authenticate, isAdmin, validatePagination, ApplicationController.getAllApplications);
router.delete('/:id', authenticate, isAdmin, validateId, ApplicationController.deleteApplication);

// Common routes
router.get('/:id', authenticate, validateId, ApplicationController.getApplicationById);

module.exports = router;
