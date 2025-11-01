// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Check if user is student
const isStudent = checkRole('student');

// Check if user is company
const isCompany = checkRole('company');

// Check if user is admin
const isAdmin = checkRole('admin');

// Check if user is student or admin
const isStudentOrAdmin = checkRole('student', 'admin');

// Check if user is company or admin
const isCompanyOrAdmin = checkRole('company', 'admin');

// Check if account is verified
const isVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.is_verified) {
        return res.status(403).json({
            success: false,
            message: 'Account not verified. Please verify your email.'
        });
    }

    next();
};

module.exports = {
    checkRole,
    isStudent,
    isCompany,
    isAdmin,
    isStudentOrAdmin,
    isCompanyOrAdmin,
    isVerified
};
