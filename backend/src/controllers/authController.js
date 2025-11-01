const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse, generateToken: generateRandomToken } = require('../utils/helpers');
const EmailService = require('../services/emailService');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, password, role, ...profileData } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return errorResponse(res, 400, 'User with this email already exists');
            }

            // Create user
            const userId = await User.create({ email, password, role });

            // Create role-specific profile
            let profileId;
            switch (role) {
                case 'student':
                    profileId = await Student.create({ user_id: userId, ...profileData });
                    break;
                case 'company':
                    profileId = await Company.create({ user_id: userId, ...profileData });
                    break;
                case 'admin':
                    profileId = await Admin.create({ user_id: userId, ...profileData });
                    break;
            }

            // Generate verification token
            const verificationToken = generateRandomToken();
            await User.setVerificationToken(userId, verificationToken);

            // Send verification email
            await EmailService.sendVerificationEmail(email, verificationToken);

            // Generate JWT token
            const token = generateToken({ id: userId, email, role });

            return successResponse(res, 201, 'User registered successfully', {
                token,
                user: {
                    id: userId,
                    email,
                    role,
                    profileId
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            return errorResponse(res, 500, 'Registration failed', error.message);
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return errorResponse(res, 401, 'Invalid email or password');
            }

            // Check if account is active
            if (!user.is_active) {
                return errorResponse(res, 401, 'Account is deactivated. Please contact support.');
            }

            // Verify password
            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return errorResponse(res, 401, 'Invalid email or password');
            }

            // Generate JWT token
            const token = generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });

            // Get role-specific profile
            let profile;
            switch (user.role) {
                case 'student':
                    profile = await Student.findByUserId(user.id);
                    break;
                case 'company':
                    profile = await Company.findByUserId(user.id);
                    break;
                case 'admin':
                    profile = await Admin.findByUserId(user.id);
                    break;
            }

            return successResponse(res, 200, 'Login successful', {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    is_verified: user.is_verified,
                    profile
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return errorResponse(res, 500, 'Login failed', error.message);
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;

            // Get user data
            const user = await User.findById(userId);
            if (!user) {
                return errorResponse(res, 404, 'User not found');
            }

            // Get role-specific profile
            let profile;
            switch (role) {
                case 'student':
                    profile = await Student.findByUserId(userId);
                    break;
                case 'company':
                    profile = await Company.findByUserId(userId);
                    break;
                case 'admin':
                    profile = await Admin.findByUserId(userId);
                    break;
            }

            return successResponse(res, 200, 'Profile retrieved successfully', {
                user,
                profile
            });
        } catch (error) {
            console.error('Get profile error:', error);
            return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
        }
    }

    // Verify email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            const success = await User.verifyUser(token);
            if (!success) {
                return errorResponse(res, 400, 'Invalid or expired verification token');
            }

            return successResponse(res, 200, 'Email verified successfully');
        } catch (error) {
            console.error('Email verification error:', error);
            return errorResponse(res, 500, 'Email verification failed', error.message);
        }
    }

    // Request password reset
    static async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                // Don't reveal if user exists
                return successResponse(res, 200, 'If the email exists, a password reset link has been sent');
            }

            // Generate reset token
            const resetToken = generateRandomToken();
            const resetExpire = new Date(Date.now() + 3600000); // 1 hour

            await User.update(user.id, {
                reset_password_token: resetToken,
                reset_password_expire: resetExpire
            });

            // Send reset email
            await EmailService.sendPasswordResetEmail(email, resetToken);

            return successResponse(res, 200, 'If the email exists, a password reset link has been sent');
        } catch (error) {
            console.error('Password reset request error:', error);
            return errorResponse(res, 500, 'Failed to process password reset request', error.message);
        }
    }

    // Reset password
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Find user with valid reset token
            const [users] = await require('../config/database').promisePool.query(
                'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW()',
                [token]
            );

            if (users.length === 0) {
                return errorResponse(res, 400, 'Invalid or expired reset token');
            }

            const user = users[0];

            // Update password
            await User.updatePassword(user.id, newPassword);

            // Clear reset token
            await User.update(user.id, {
                reset_password_token: null,
                reset_password_expire: null
            });

            return successResponse(res, 200, 'Password reset successful');
        } catch (error) {
            console.error('Password reset error:', error);
            return errorResponse(res, 500, 'Password reset failed', error.message);
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Get user
            const user = await User.findByEmail(req.user.email);
            if (!user) {
                return errorResponse(res, 404, 'User not found');
            }

            // Verify current password
            const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
            if (!isPasswordValid) {
                return errorResponse(res, 401, 'Current password is incorrect');
            }

            // Update password
            await User.updatePassword(userId, newPassword);

            return successResponse(res, 200, 'Password changed successfully');
        } catch (error) {
            console.error('Change password error:', error);
            return errorResponse(res, 500, 'Failed to change password', error.message);
        }
    }

    // Logout (client-side token removal, but can log the event)
    static async logout(req, res) {
        try {
            // In a stateless JWT system, logout is handled client-side
            // This endpoint can be used for logging purposes
            return successResponse(res, 200, 'Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
            return errorResponse(res, 500, 'Logout failed', error.message);
        }
    }
}

module.exports = AuthController;
