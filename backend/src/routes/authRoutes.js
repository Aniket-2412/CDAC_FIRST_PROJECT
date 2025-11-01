const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
