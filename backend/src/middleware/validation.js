const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    next();
};

// User registration validation
const validateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .isIn(['student', 'company', 'admin'])
        .withMessage('Role must be student, company, or admin'),
    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Student profile validation
const validateStudentProfile = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('cgpa')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('CGPA must be between 0 and 10'),
    handleValidationErrors
];

// Company profile validation
const validateCompanyProfile = [
    body('company_name')
        .trim()
        .notEmpty()
        .withMessage('Company name is required'),
    body('company_email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('company_phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
    handleValidationErrors
];

// Job posting validation
const validateJobPosting = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required'),
    body('job_type')
        .isIn(['full-time', 'part-time', 'internship', 'contract'])
        .withMessage('Invalid job type'),
    body('work_mode')
        .optional()
        .isIn(['on-site', 'remote', 'hybrid'])
        .withMessage('Invalid work mode'),
    body('salary_min')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum salary must be a positive number'),
    body('salary_max')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum salary must be a positive number'),
    body('number_of_openings')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Number of openings must be at least 1'),
    handleValidationErrors
];

// Application validation
const validateApplication = [
    body('job_id')
        .isInt({ min: 1 })
        .withMessage('Valid job ID is required'),
    body('cover_letter')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Cover letter must not exceed 2000 characters'),
    handleValidationErrors
];

// Interview validation
const validateInterview = [
    body('application_id')
        .isInt({ min: 1 })
        .withMessage('Valid application ID is required'),
    body('interview_type')
        .isIn(['technical', 'hr', 'managerial', 'group-discussion', 'final'])
        .withMessage('Invalid interview type'),
    body('interview_mode')
        .isIn(['in-person', 'video', 'phone'])
        .withMessage('Invalid interview mode'),
    body('scheduled_date')
        .isDate()
        .withMessage('Valid date is required'),
    body('scheduled_time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Valid time is required (HH:MM format)'),
    body('interviewer_email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required'),
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validateStudentProfile,
    validateCompanyProfile,
    validateJobPosting,
    validateApplication,
    validateInterview,
    validateId,
    validatePagination
};
