const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Email configuration
const emailConfig = {
    from: process.env.EMAIL_FROM || 'noreply@placement.com',
    transporter: createTransporter()
};

// Test email connection
const testEmailConnection = async () => {
    try {
        await emailConfig.transporter.verify();
        console.log('✅ Email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Email service error:', error.message);
        return false;
    }
};

module.exports = {
    emailConfig,
    testEmailConnection
};
