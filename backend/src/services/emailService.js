const { emailConfig } = require('../config/email');

class EmailService {
    // Send welcome email
    static async sendWelcomeEmail(email, name) {
        try {
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: 'Welcome to Placement Management System',
                html: `
                    <h1>Welcome ${name}!</h1>
                    <p>Thank you for registering with our Placement Management System.</p>
                    <p>You can now access all the features of our platform.</p>
                    <p>Best regards,<br>Placement Team</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }
    }

    // Send verification email
    static async sendVerificationEmail(email, token) {
        try {
            const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
            
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: 'Verify Your Email Address',
                html: `
                    <h1>Email Verification</h1>
                    <p>Please click the link below to verify your email address:</p>
                    <a href="${verificationLink}">${verificationLink}</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            return false;
        }
    }

    // Send password reset email
    static async sendPasswordResetEmail(email, token) {
        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
            
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>You requested to reset your password. Click the link below:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return false;
        }
    }

    // Send application confirmation email
    static async sendApplicationConfirmation(email, studentName, jobTitle, companyName) {
        try {
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: 'Application Submitted Successfully',
                html: `
                    <h1>Application Confirmation</h1>
                    <p>Dear ${studentName},</p>
                    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
                    <p>We will notify you once the company reviews your application.</p>
                    <p>Best regards,<br>Placement Team</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending application confirmation:', error);
            return false;
        }
    }

    // Send interview invitation email
    static async sendInterviewInvitation(email, studentName, jobTitle, companyName, interviewDetails) {
        try {
            const { scheduled_date, scheduled_time, interview_mode, location, meeting_link } = interviewDetails;
            
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: `Interview Scheduled - ${jobTitle} at ${companyName}`,
                html: `
                    <h1>Interview Invitation</h1>
                    <p>Dear ${studentName},</p>
                    <p>Congratulations! You have been shortlisted for an interview.</p>
                    <h3>Interview Details:</h3>
                    <ul>
                        <li><strong>Position:</strong> ${jobTitle}</li>
                        <li><strong>Company:</strong> ${companyName}</li>
                        <li><strong>Date:</strong> ${scheduled_date}</li>
                        <li><strong>Time:</strong> ${scheduled_time}</li>
                        <li><strong>Mode:</strong> ${interview_mode}</li>
                        ${location ? `<li><strong>Location:</strong> ${location}</li>` : ''}
                        ${meeting_link ? `<li><strong>Meeting Link:</strong> <a href="${meeting_link}">${meeting_link}</a></li>` : ''}
                    </ul>
                    <p>Please be on time and prepare well for the interview.</p>
                    <p>Best of luck!<br>Placement Team</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending interview invitation:', error);
            return false;
        }
    }

    // Send application status update email
    static async sendApplicationStatusUpdate(email, studentName, jobTitle, companyName, status) {
        try {
            let statusMessage = '';
            
            switch (status) {
                case 'shortlisted':
                    statusMessage = 'Your application has been shortlisted!';
                    break;
                case 'rejected':
                    statusMessage = 'Unfortunately, your application was not selected this time.';
                    break;
                case 'selected':
                    statusMessage = 'Congratulations! You have been selected!';
                    break;
                default:
                    statusMessage = `Your application status has been updated to: ${status}`;
            }
            
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: `Application Status Update - ${jobTitle}`,
                html: `
                    <h1>Application Status Update</h1>
                    <p>Dear ${studentName},</p>
                    <p>${statusMessage}</p>
                    <p><strong>Position:</strong> ${jobTitle}</p>
                    <p><strong>Company:</strong> ${companyName}</p>
                    <p>Thank you for your interest.</p>
                    <p>Best regards,<br>Placement Team</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending status update email:', error);
            return false;
        }
    }

    // Send new job notification
    static async sendNewJobNotification(email, studentName, jobTitle, companyName) {
        try {
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: `New Job Opening - ${jobTitle}`,
                html: `
                    <h1>New Job Opportunity</h1>
                    <p>Dear ${studentName},</p>
                    <p>A new job opening matching your profile has been posted:</p>
                    <p><strong>Position:</strong> ${jobTitle}</p>
                    <p><strong>Company:</strong> ${companyName}</p>
                    <p>Login to your account to view details and apply.</p>
                    <p>Best regards,<br>Placement Team</p>
                `
            };

            await emailConfig.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending job notification:', error);
            return false;
        }
    }
}

module.exports = EmailService;
