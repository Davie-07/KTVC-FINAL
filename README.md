# School Management System

A comprehensive MERN stack school management system with 6 specialized dashboards.

## Features

### 6 Dashboards:
1. **Student Dashboard** - View courses, timetables, performance, fees, assignments
2. **Teacher Dashboard** - Manage classes, assignments, grades, schedules
3. **Admin Dashboard** - System administration and user management
4. **Gate Verification Dashboard** - Verify student entry/exit with receipts
5. **Finance Dashboard** - Manage fee payments and financial records
6. **New Student Enrollment Dashboard** - Handle new admissions

## Tech Stack

- **Frontend**: React, TailwindCSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up MongoDB:
   - Create a MongoDB Atlas account or use local MongoDB
   - Update the connection string in `server/.env`

3. Seed the database:
```bash
cd server
node seed.js
```

4. Run the application:
```bash
npm run dev
```

The frontend will run on http://localhost:3000
The backend will run on http://localhost:5000

## Default Login Credentials

Will be displayed after running seed.js
