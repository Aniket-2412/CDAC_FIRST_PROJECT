# Placement Management System

A comprehensive full-stack application for managing campus placement activities, connecting students with companies, and streamlining the recruitment process.

## Project Structure

```
.
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Configuration files (database, JWT, email)
│   │   ├── models/            # Database models
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware (auth, validation, upload)
│   │   ├── services/          # Business logic services (email, SMS, notifications)
│   │   ├── utils/             # Helper functions and validators
│   │   └── app.js             # Main application file
│   ├── uploads/               # File uploads directory
│   ├── package.json
│   └── .env                   # Environment variables
│
├── database/                   # Database files
│   ├── schema.sql             # Database schema
│   ├── setup.sh               # Database setup script
│   ├── migrations/            # Database migrations
│   └── seeds/                 # Seed data
│
└── README.md                   # This file
```

## Features

### For Students
- ✅ Profile management with resume upload
- ✅ Browse and search job openings
- ✅ Apply for jobs with cover letters
- ✅ Track application status
- ✅ View scheduled interviews
- ✅ Receive email notifications

### For Companies
- ✅ Company profile with logo upload
- ✅ Post job openings
- ✅ Manage job postings
- ✅ Review student applications
- ✅ Schedule interviews
- ✅ Provide interview feedback
- ✅ Track recruitment pipeline

### For Admins
- ✅ Dashboard with statistics
- ✅ Manage users (students, companies)
- ✅ Verify company registrations
- ✅ Monitor all activities
- ✅ Generate reports

### Technical Features
- 🔐 JWT-based authentication
- 🛡️ Role-based access control
- 📧 Email notifications
- 📁 File upload handling
- ✅ Input validation
- 🔍 Search and filtering
- 📄 Pagination
- 🚀 RESTful API design

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Validation**: express-validator

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   cd placement-management-system
   ```

2. **Setup Database**
   ```bash
   cd database
   chmod +x setup.sh
   ./setup.sh
   ```
   
   Or manually:
   ```bash
   mysql -u root -pCDACCDAC < schema.sql
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment**
   - Update `backend/.env` with your configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=CDACCDAC
   DB_NAME=mydb
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   
   The API will be available at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

#### Students
- `GET /students/profile` - Get student profile
- `PUT /students/profile` - Update student profile
- `POST /students/upload-resume` - Upload resume

#### Companies
- `GET /companies` - Get all companies
- `GET /companies/profile` - Get company profile
- `PUT /companies/profile` - Update company profile

#### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/active` - Get active jobs
- `POST /jobs` - Create job (Company only)
- `GET /jobs/:id` - Get job details

#### Applications
- `POST /applications` - Submit application (Student only)
- `GET /applications/my-applications` - Get student's applications
- `GET /applications/company/applications` - Get company's applications
- `PATCH /applications/:id/status` - Update application status

#### Interviews
- `POST /interviews` - Schedule interview (Company/Admin)
- `GET /interviews/my-interviews` - Get student's interviews
- `GET /interviews/upcoming` - Get upcoming interviews

For complete API documentation, see `backend/README.md`

## Database Schema

### Main Tables
- **users** - Base authentication table
- **students** - Student profiles and academic details
- **companies** - Company profiles and information
- **admins** - Administrator accounts
- **jobs** - Job postings
- **applications** - Job applications
- **interviews** - Interview schedules and feedback

### Relationships
- One user can have one role-specific profile (student/company/admin)
- One company can post multiple jobs
- One job can have multiple applications
- One application can have multiple interviews

## Default Credentials

### Admin Account
- **Email**: admin@placement.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## Development

### Running in Development Mode
```bash
cd backend
npm run dev
```

### Project Structure Best Practices
- Models handle database operations
- Controllers handle business logic
- Routes define API endpoints
- Middleware handles authentication, validation, and file uploads
- Services handle external integrations (email, SMS)
- Utils contain helper functions

## Testing

### Manual Testing
Use tools like Postman or cURL to test API endpoints:

```bash
# Register a new student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update JWT_SECRET with a strong secret
- [ ] Configure production database
- [ ] Setup SSL/TLS certificates
- [ ] Configure email service
- [ ] Setup file storage (local or cloud)
- [ ] Implement rate limiting
- [ ] Setup logging and monitoring
- [ ] Configure backup strategy

### Using PM2 (Process Manager)
```bash
npm install -g pm2
cd backend
pm2 start src/app.js --name placement-api
pm2 save
pm2 startup
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation
- ✅ CORS configuration
- ✅ Environment variable protection

## Future Enhancements

- [ ] Frontend application (React/Vue/Angular)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search with filters
- [ ] Analytics and reporting dashboard
- [ ] Document generation (offer letters, etc.)
- [ ] Calendar integration
- [ ] Mobile application
- [ ] Video interview integration
- [ ] AI-based resume parsing
- [ ] Skill assessment tests

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -pCDACCDAC -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Email Not Sending
- Verify email credentials in `.env`
- For Gmail, enable "Less secure app access" or use App Password
- Check firewall settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions:
- Check the documentation
- Review existing issues
- Contact the development team

## License

ISC

## Acknowledgments

Built with ❤️ for campus placement management.

---

**Note**: This is a complete backend implementation. A frontend application can be built using React, Vue, or Angular to consume these APIs.
