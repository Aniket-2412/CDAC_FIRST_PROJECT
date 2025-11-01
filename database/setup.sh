#!/bin/bash

# Database Setup Script for Placement Management System

echo "=================================="
echo "Database Setup Script"
echo "=================================="
echo ""

# Database credentials
DB_USER="root"
DB_PASSWORD="CDACCDAC"
DB_NAME="mydb"

echo "Setting up database: $DB_NAME"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ MySQL found"
echo ""

# Create database and run schema
echo "Creating database and tables..."
mysql -u $DB_USER -p$DB_PASSWORD < schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "Database Details:"
    echo "  - Database Name: $DB_NAME"
    echo "  - User: $DB_USER"
    echo "  - Password: $DB_PASSWORD"
    echo ""
    echo "Default Admin Account:"
    echo "  - Email: admin@placement.com"
    echo "  - Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the default admin password after first login!"
    echo ""
else
    echo ""
    echo "❌ Database setup failed. Please check the error messages above."
    exit 1
fi
