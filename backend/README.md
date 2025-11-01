# Placement Management System - Backend API

A comprehensive backend API for managing placement activities including student profiles, company registrations, job postings, applications, and interviews.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Roles**: Student, Company, Admin
- **Student Management**: Profile management, resume uploads, skill tracking
- **Company Management**: Company profiles, verification system, logo uploads
- **Job Management**: Job postings, search, filtering
- **Application Management**: Job applications, status tracking, notifications
- **Interview Management**: Interview scheduling, feedback, status updates
- **Email Notifications**: Automated emails for applications, interviews, status updates
- **File Uploads**: Resume, document, and logo uploads with validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Validation**: express-validator

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env` file and update the values:
   ```
   PORT=5000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=CDACCDAC
   DB_NAME=mydb
   DB_PORT=3306
   
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@placement.com
   ```

4. **Setup MySQL Database**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Run the schema file
   source ../database/schema.sql
   ```
   
   Or manually:
   ```bash
   mysql -u root -pCDACCDAC < ../database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `POST /api/students/upload-resume` - Upload resume
- `POST /api/students/upload-profile-image` - Upload profile image
- `GET /api/students` - Get all students (Admin)
- `GET /api/students/search` - Search students by skills (Admin)
- `GET /api/students/:id` - Get student by ID (Admin)
- `DELETE /api/students/:id` - Delete student (Admin)

### Companies
- `GET /api/companies/profile` - Get company profile
- `PUT /api/companies/profile` - Update company profile
- `POST /api/companies/upload-logo` - Upload company logo
- `GET /api/companies` - Get all companies
- `GET /api/companies/search` - Search companies by name
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies/:id/verify` - Verify company (Admin)
- `GET /api/companies/admin/pending-verifications` - Get pending verifications (Admin)
- `DELETE /api/companies/:id` - Delete company (Admin)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/active` - Get active jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Company)
- `GET /api/jobs/company/my-jobs` - Get company's jobs (Company)
- `PUT /api/jobs/:id` - Update job (Company/Admin)
- `PATCH /api/jobs/:id/status` - Update job status (Company/Admin)
- `DELETE /api/jobs/:id` - Delete job (Company/Admin)

### Applications
- `POST /api/applications` - Submit application (Student)
- `GET /api/applications/my-applications` - Get student's applications (Student)
- `PATCH /api/applications/:id/withdraw` - Withdraw application (Student)
- `GET /api/applications/statistics` - Get application statistics (Student)
- `GET /api/applications/company/applications` - Get company's applications (Company)
- `GET /api/applications/job/:job_id` - Get applications for a job (Company/Admin)
- `PATCH /api/applications/:id/status` - Update application status (Company/Admin)
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/:id` - Get application by ID
- `DELETE /api/applications/:id` - Delete application (Admin)

### Interviews
- `POST /api/interviews` - Schedule interview (Company/Admin)
- `GET /api/interviews/my-interviews` - Get student's interviews (Student)
- `GET /api/interviews/company/interviews` - Get company's interviews (Company)
- `GET /api/interviews/upcoming` - Get upcoming interviews
- `GET /api/interviews/:id` - Get interview by ID
- `PUT /api/interviews/:id` - Update interview (Company/Admin)
- `PATCH /api/interviews/:id/status` - Update interview status (Company/Admin)
- `POST /api/interviews/:id/feedback` - Add interview feedback (Company/Admin)
- `DELETE /api/interviews/:id` - Delete interview (Company/Admin)
- `GET /api/interviews` - Get all interviews (Admin)

### Admin
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Activate/Deactivate user
- `DELETE /api/admin/users/:id` - Delete user

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

- **Resumes**: PDF, DOC, DOCX (Max 5MB)
- **Logos**: JPG, JPEG, PNG (Max 5MB)
- **Profile Images**: JPG, JPEG, PNG (Max 5MB)

Uploaded files are stored in the `uploads/` directory.

## Database Schema

The database includes the following tables:
- `users` - Base user authentication
- `students` - Student profiles
- `companies` - Company profiles
- `admins` - Admin profiles
- `jobs` - Job postings
- `applications` - Job applications
- `interviews` - Interview schedules

See `database/schema.sql` for complete schema.

## Default Admin Account

- **Email**: admin@placement.com
- **Password**: admin123

**Important**: Change the default admin password after first login!

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update JWT_SECRET with a strong secret key
3. Configure email service credentials
4. Setup SSL/TLS for HTTPS
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name placement-api
   ```

## Security Considerations

- Always use HTTPS in production
- Keep JWT_SECRET secure and never commit it to version control
- Regularly update dependencies
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use prepared statements for database queries (already implemented)

## Support

For issues and questions, please contact the development team.

## License

ISC
