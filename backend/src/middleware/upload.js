const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Configure storage for resumes
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/resumes');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/documents');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for logos
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/logos');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for documents (PDF, DOC, DOCX)
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
};

// File filter for images (JPG, JPEG, PNG)
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed'));
    }
};

// File size limit (5MB)
const fileSizeLimit = 5 * 1024 * 1024;

// Upload middleware for resumes
const uploadResume = multer({
    storage: resumeStorage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: documentFileFilter
}).single('resume');

// Upload middleware for documents
const uploadDocument = multer({
    storage: documentStorage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: documentFileFilter
}).single('document');

// Upload middleware for logos
const uploadLogo = multer({
    storage: logoStorage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: imageFileFilter
}).single('logo');

// Upload middleware for profile images
const uploadProfileImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '../../uploads/documents');
            ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: fileSizeLimit },
    fileFilter: imageFileFilter
}).single('profile_image');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = {
    uploadResume,
    uploadDocument,
    uploadLogo,
    uploadProfileImage,
    handleUploadError
};
