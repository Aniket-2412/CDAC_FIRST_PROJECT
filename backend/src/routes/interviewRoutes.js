const express = require('express');
const router = express.Router();
const InterviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');
const { isStudent, isCompany, isAdmin, isCompanyOrAdmin } = require('../middleware/roleCheck');
const { validateInterview, validateId, validatePagination } = require('../middleware/validation');

// Company routes
router.post('/', authenticate, isCompanyOrAdmin, validateInterview, InterviewController.scheduleInterview);
router.get('/company/interviews', authenticate, isCompany, validatePagination, InterviewController.getCompanyInterviews);
router.put('/:id', authenticate, isCompanyOrAdmin, validateId, InterviewController.updateInterview);
router.patch('/:id/status', authenticate, isCompanyOrAdmin, validateId, InterviewController.updateInterviewStatus);
router.post('/:id/feedback', authenticate, isCompanyOrAdmin, validateId, InterviewController.addFeedback);
router.delete('/:id', authenticate, isCompanyOrAdmin, validateId, InterviewController.deleteInterview);

// Student routes
router.get('/my-interviews', authenticate, isStudent, validatePagination, InterviewController.getStudentInterviews);

// Common routes
router.get('/upcoming', authenticate, validatePagination, InterviewController.getUpcomingInterviews);
router.get('/:id', authenticate, validateId, InterviewController.getInterviewById);

// Admin routes
router.get('/', authenticate, isAdmin, validatePagination, InterviewController.getAllInterviews);

module.exports = router;
