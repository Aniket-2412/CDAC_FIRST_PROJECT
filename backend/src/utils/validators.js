// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
    // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};

// Validate phone number (Indian format)
const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Validate URL
const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

// Validate date format (YYYY-MM-DD)
const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
};

// Validate time format (HH:MM)
const validateTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

// Validate CGPA (0-10)
const validateCGPA = (cgpa) => {
    const cgpaNum = parseFloat(cgpa);
    return !isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 10;
};

// Validate year
const validateYear = (year) => {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 10;
};

// Validate pincode (Indian format)
const validatePincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
};

// Validate file type
const validateFileType = (filename, allowedTypes) => {
    const extension = filename.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
};

// Validate file size (in bytes)
const validateFileSize = (fileSize, maxSize) => {
    return fileSize <= maxSize;
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
            missingFields.push(field);
        }
    });
    
    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
};

// Validate enum value
const validateEnum = (value, allowedValues) => {
    return allowedValues.includes(value);
};

// Validate salary range
const validateSalaryRange = (minSalary, maxSalary) => {
    const min = parseFloat(minSalary);
    const max = parseFloat(maxSalary);
    
    if (isNaN(min) || isNaN(max)) return false;
    if (min < 0 || max < 0) return false;
    if (min > max) return false;
    
    return true;
};

// Validate application deadline
const validateApplicationDeadline = (deadline) => {
    if (!validateDate(deadline)) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return deadlineDate >= today;
};

// Validate interview schedule
const validateInterviewSchedule = (date, time) => {
    if (!validateDate(date) || !validateTime(time)) return false;
    
    const scheduleDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    return scheduleDateTime > now;
};

// Sanitize input (remove HTML tags and special characters)
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim();
};

// Validate student profile completeness
const validateStudentProfileCompleteness = (student) => {
    const requiredFields = [
        'first_name', 'last_name', 'phone', 'college_name',
        'degree', 'branch', 'year_of_passing', 'cgpa'
    ];
    
    const result = validateRequiredFields(student, requiredFields);
    
    return {
        isComplete: result.isValid,
        missingFields: result.missingFields,
        completionPercentage: ((requiredFields.length - result.missingFields.length) / requiredFields.length) * 100
    };
};

// Validate company profile completeness
const validateCompanyProfileCompleteness = (company) => {
    const requiredFields = [
        'company_name', 'company_email', 'company_phone',
        'industry', 'description', 'city'
    ];
    
    const result = validateRequiredFields(company, requiredFields);
    
    return {
        isComplete: result.isValid,
        missingFields: result.missingFields,
        completionPercentage: ((requiredFields.length - result.missingFields.length) / requiredFields.length) * 100
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateURL,
    validateDate,
    validateTime,
    validateCGPA,
    validateYear,
    validatePincode,
    validateFileType,
    validateFileSize,
    validateRequiredFields,
    validateEnum,
    validateSalaryRange,
    validateApplicationDeadline,
    validateInterviewSchedule,
    sanitizeInput,
    validateStudentProfileCompleteness,
    validateCompanyProfileCompleteness
};
