require('dotenv').config();

class SMSService {
    // Send SMS (placeholder - integrate with actual SMS provider like Twilio, AWS SNS, etc.)
    static async sendSMS(phone, message) {
        try {
            // This is a placeholder implementation
            // In production, integrate with actual SMS service provider
            
            console.log(`SMS to ${phone}: ${message}`);
            
            // Example integration with Twilio (commented out):
            /*
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = require('twilio')(accountSid, authToken);
            
            await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            */
            
            return true;
        } catch (error) {
            console.error('Error sending SMS:', error);
            return false;
        }
    }

    // Send interview reminder SMS
    static async sendInterviewReminder(phone, studentName, jobTitle, date, time) {
        const message = `Hi ${studentName}, Reminder: Your interview for ${jobTitle} is scheduled on ${date} at ${time}. Good luck!`;
        return await this.sendSMS(phone, message);
    }

    // Send application status SMS
    static async sendApplicationStatusSMS(phone, studentName, jobTitle, status) {
        const message = `Hi ${studentName}, Your application for ${jobTitle} has been ${status}. Check your email for details.`;
        return await this.sendSMS(phone, message);
    }

    // Send OTP SMS
    static async sendOTP(phone, otp) {
        const message = `Your OTP for Placement Management System is: ${otp}. Valid for 10 minutes.`;
        return await this.sendSMS(phone, message);
    }
}

module.exports = SMSService;
