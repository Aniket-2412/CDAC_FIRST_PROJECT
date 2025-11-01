const crypto = require('crypto');

// Generate random token
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate OTP
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Format time to HH:MM
const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Calculate pagination
const calculatePagination = (page = 1, limit = 10) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    return {
        page: pageNum,
        limit: limitNum,
        offset: offset
    };
};

// Create pagination response
const createPaginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
        data: data,
        pagination: {
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

// Sanitize user data (remove sensitive fields)
const sanitizeUser = (user) => {
    if (!user) return null;
    
    const { password, verification_token, reset_password_token, ...sanitized } = user;
    return sanitized;
};

// Create success response
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message: message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

// Create error response
const errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message: message
    };
    
    if (errors !== null) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

// Check if date is in the past
const isPastDate = (date) => {
    return new Date(date) < new Date();
};

// Check if date is in the future
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

// Get file extension
const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = getFileExtension(originalName);
    return `${timestamp}-${random}.${extension}`;
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number format (Indian format)
const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

// Slugify string
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

module.exports = {
    generateToken,
    generateOTP,
    formatDate,
    formatTime,
    calculatePagination,
    createPaginationResponse,
    sanitizeUser,
    successResponse,
    errorResponse,
    isPastDate,
    isFutureDate,
    getFileExtension,
    generateUniqueFilename,
    isValidEmail,
    isValidPhone,
    calculateAge,
    slugify
};
