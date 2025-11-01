const EmailService = require('./emailService');
const SMSService = require('./smsService');

class NotificationService {
    // Send notification via multiple channels
    static async sendNotification(channels, data) {
        const results = {
            email: false,
            sms: false
        };

        if (channels.includes('email') && data.email) {
            results.email = await this.sendEmailNotification(data);
        }

        if (channels.includes('sms') && data.phone) {
            results.sms = await this.sendSMSNotification(data);
        }

        return results;
    }

    // Send email notification
    static async sendEmailNotification(data) {
        const { type, email, ...rest } = data;

        switch (type) {
            case 'welcome':
                return await EmailService.sendWelcomeEmail(email, rest.name);
            
            case 'verification':
                return await EmailService.sendVerificationEmail(email, rest.token);
            
            case 'password-reset':
                return await EmailService.sendPasswordResetEmail(email, rest.token);
            
            case 'application-confirmation':
                return await EmailService.sendApplicationConfirmation(
                    email, rest.studentName, rest.jobTitle, rest.companyName
                );
            
            case 'interview-invitation':
                return await EmailService.sendInterviewInvitation(
                    email, rest.studentName, rest.jobTitle, rest.companyName, rest.interviewDetails
                );
            
            case 'application-status':
                return await EmailService.sendApplicationStatusUpdate(
                    email, rest.studentName, rest.jobTitle, rest.companyName, rest.status
                );
            
            case 'new-job':
                return await EmailService.sendNewJobNotification(
                    email, rest.studentName, rest.jobTitle, rest.companyName
                );
            
            default:
                console.log('Unknown email notification type:', type);
                return false;
        }
    }

    // Send SMS notification
    static async sendSMSNotification(data) {
        const { type, phone, ...rest } = data;

        switch (type) {
            case 'interview-reminder':
                return await SMSService.sendInterviewReminder(
                    phone, rest.studentName, rest.jobTitle, rest.date, rest.time
                );
            
            case 'application-status':
                return await SMSService.sendApplicationStatusSMS(
                    phone, rest.studentName, rest.jobTitle, rest.status
                );
            
            case 'otp':
                return await SMSService.sendOTP(phone, rest.otp);
            
            default:
                console.log('Unknown SMS notification type:', type);
                return false;
        }
    }

    // Notify student about application status
    static async notifyApplicationStatus(studentData, jobData, status) {
        return await this.sendNotification(['email'], {
            type: 'application-status',
            email: studentData.email,
            studentName: `${studentData.first_name} ${studentData.last_name}`,
            jobTitle: jobData.title,
            companyName: jobData.company_name,
            status: status
        });
    }

    // Notify student about interview
    static async notifyInterview(studentData, jobData, interviewDetails) {
        return await this.sendNotification(['email', 'sms'], {
            type: 'interview-invitation',
            email: studentData.email,
            phone: studentData.phone,
            studentName: `${studentData.first_name} ${studentData.last_name}`,
            jobTitle: jobData.title,
            companyName: jobData.company_name,
            interviewDetails: interviewDetails
        });
    }

    // Send interview reminder
    static async sendInterviewReminder(studentData, jobData, interviewDate, interviewTime) {
        return await this.sendNotification(['sms'], {
            type: 'interview-reminder',
            phone: studentData.phone,
            studentName: `${studentData.first_name} ${studentData.last_name}`,
            jobTitle: jobData.title,
            date: interviewDate,
            time: interviewTime
        });
    }
}

module.exports = NotificationService;
