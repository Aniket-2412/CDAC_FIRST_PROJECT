const express = require('express');
const router = express.Router();
const JobController = require('../controllers/jobController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isCompany, isAdmin, isCompanyOrAdmin } = require('../middleware/roleCheck');
const { validateJobPosting, validateId, validatePagination } = require('../middleware/validation');

// Public routes (with optional auth)
router.get('/', optionalAuth, validatePagination, JobController.getAllJobs);
router.get('/active', optionalAuth, validatePagination, JobController.getActiveJobs);
router.get('/search', optionalAuth, validatePagination, JobController.searchJobs);
router.get('/:id', optionalAuth, validateId, JobController.getJobById);

// Company routes (protected)
router.post('/', authenticate, isCompany, validateJobPosting, JobController.createJob);
router.get('/company/my-jobs', authenticate, isCompany, validatePagination, JobController.getJobsByCompany);
router.put('/:id', authenticate, isCompanyOrAdmin, validateId, JobController.updateJob);
router.patch('/:id/status', authenticate, isCompanyOrAdmin, validateId, JobController.updateJobStatus);
router.delete('/:id', authenticate, isCompanyOrAdmin, validateId, JobController.deleteJob);

module.exports = router;
