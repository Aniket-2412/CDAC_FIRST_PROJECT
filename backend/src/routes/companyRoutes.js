const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { isCompany, isAdmin, isCompanyOrAdmin } = require('../middleware/roleCheck');
const { validateCompanyProfile, validateId, validatePagination } = require('../middleware/validation');
const { uploadLogo, handleUploadError } = require('../middleware/upload');

// Company routes (protected)
router.get('/profile', authenticate, isCompany, CompanyController.getProfile);
router.put('/profile', authenticate, isCompany, validateCompanyProfile, CompanyController.updateProfile);
router.post('/upload-logo', authenticate, isCompany, uploadLogo, handleUploadError, CompanyController.updateProfile);

// Public/Protected routes
router.get('/', authenticate, validatePagination, CompanyController.getAllCompanies);
router.get('/search', authenticate, validatePagination, CompanyController.searchByName);
router.get('/:id', authenticate, validateId, CompanyController.getCompanyById);

// Admin routes
router.post('/:id/verify', authenticate, isAdmin, validateId, CompanyController.verifyCompany);
router.get('/admin/pending-verifications', authenticate, isAdmin, CompanyController.getPendingVerifications);
router.delete('/:id', authenticate, isAdmin, validateId, CompanyController.deleteCompany);

module.exports = router;
