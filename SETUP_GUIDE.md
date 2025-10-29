# School Management System - Setup Guide

## 🎓 Student Dashboard - Complete Implementation

The Student Dashboard includes all requested features:

### ✅ Sidebar Navigation (0.7/4 width on desktop)
- **Responsive design** - Adapts to all screen sizes
- **Menu items**: Home, Notifications, Services, GateRcpt, DeeAI, Logout
- **School logo** at the top with user profile section
- **Mobile responsive** with hamburger menu

### ✅ Home Section Features

1. **Welcome Section**
   - Personalized greeting with user's name
   - Daily motivational quotes that change each day of the week
   - Shows enrolled course information

2. **Enrolled Units**
   - Displays all units assigned to student's course/level
   - Shows unit code, credits, and teacher name
   - Scrollable list with hover effects

3. **Assignments**
   - Shows assignments with deadlines
   - Visual indicators for overdue assignments
   - Days remaining counter
   - Teacher and unit information

4. **Timetable**
   - Full weekly timetable in table format
   - Shows: Day, Time, Unit, Teacher, Venue
   - Published from teacher dashboard
   - Read-only for students

5. **My Performance**
   - Unit-wise scores displayed
   - Average score calculation
   - **Line graph visualization** using Recharts
   - Fetches data from teacher's grade entries

6. **Fee Payments**
   - Total fees, amount paid, balance
   - Past semester balances included
   - **Pie chart visualization** for fee breakdown
   - Payment history available

7. **Help, Suggestions, Complaints**
   - Form with category selection (Help/Suggestion/Complaint)
   - Subject and message fields
   - Direct submission to admin dashboard
   - Success/error notifications

### ✅ Notifications Section
- Filter by type (exam, fee, assignment, performance, gatepass)
- Mark as read functionality
- Priority indicators
- Real-time updates from all dashboards

### ✅ Services Section
- **KRA API Integration ready** (placeholder for real API)
- KRA PIN verification interface
- Links to government services (NSSF, NHIF, eCitizen)
- Instructions for API setup

### ✅ GateRcpt Section
- Beautiful receipt design
- Shows: School name, date, time, validity
- **6-digit verification code**
- Generated after 3 verifications by gate dashboard
- Valid only for current day

### ✅ DeeAI Section
- AI learning assistant chatbot
- Helps with studies, assignments, exam prep
- Rule-based responses with contextual help
- Quick tip buttons for common queries
- Clean chat interface

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Configure MongoDB

1. **Option A: MongoDB Atlas (Cloud)**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get connection string
   - Update `server/.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
     ```

2. **Option B: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Use default connection in `.env`:
     ```
     MONGODB_URI=mongodb://localhost:27017/school_management
     ```

### Step 3: Seed the Database

```bash
cd server
node seed.js
```

This will create:
- Sample courses (IT, Business, Engineering)
- Default users for all roles
- Units, timetables, assignments
- Performance records, fee payments
- Daily motivational quotes

**Default login credentials will be displayed!**

### Step 4: Run the Application

**Option A: Run both together**
```bash
# From root directory
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

The application will open at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🔐 Default Login Credentials

After running seed.js, use these credentials:

**Student Dashboard:**
- Email: `student@school.com`
- Password: `student123`

**Teacher:**
- Email: `teacher@school.com`
- Password: `teacher123`

**Admin:**
- Email: `admin@school.com`
- Password: `admin123`

**Finance:**
- Email: `finance@school.com`
- Password: `finance123`

**Gate Verification:**
- Email: `gate@school.com`
- Password: `gate123`

**Enrollment:**
- Email: `enrollment@school.com`
- Password: `enrollment123`

## 🎨 Design Features

### Responsive Sidebar
- **Desktop**: Takes 17.5% width (approximately 0.7/4)
- **Tablet**: Collapsible with smooth animations
- **Mobile**: Hamburger menu with overlay
- Font sizes scale responsively
- Proper spacing on all devices

### Modern UI
- **TailwindCSS** for styling
- **Lucide Icons** for modern iconography
- **Recharts** for data visualization
- Gradient backgrounds and shadows
- Smooth transitions and hover effects

### Charts & Visualizations
- **Line Chart**: Performance tracking
- **Pie Chart**: Fee payment breakdown
- Responsive and interactive
- Tooltips on hover

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full sidebar, multi-column layouts
- **Tablet**: Collapsible sidebar, 2-column grids
- **Mobile**: Hidden sidebar with menu, single column

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔌 KRA API Integration

To connect real KRA services:

1. Register at KRA iTax portal
2. Apply for API credentials
3. Add to `server/.env`:
   ```
   KRA_API_KEY=your_api_key
   KRA_API_SECRET=your_api_secret
   ```
4. Update `server/routes/kra.js` with actual endpoints

## 📊 Database Models

- **User**: Students, teachers, admin, finance, gate, enrollment
- **Course**: IT, Business, Engineering programs
- **Unit**: Course subjects with teachers
- **Timetable**: Weekly schedules
- **Assignment**: Homework with deadlines
- **Performance**: Grades and assessments
- **Fee**: Payment records and balances
- **GatePass**: Verification receipts
- **Notification**: System-wide alerts
- **Complaint**: Help/suggestion/complaint tickets
- **Quote**: Daily motivational quotes

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- TailwindCSS
- Recharts
- Lucide Icons
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for passwords
- Security middleware (helmet, rate-limit, sanitize)

## 📝 Next Steps

To add more dashboards:
1. Create routes in `server/routes/`
2. Create components in `client/src/pages/`
3. Add protected routes in `App.js`
4. Update navigation based on user role

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Find and kill process on port 3000 or 5000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection error:**
- Check if MongoDB is running
- Verify connection string
- Check network access in Atlas

**Module not found:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions, submit through the Help section in the dashboard or contact the development team.

---

**🎉 Your Student Dashboard is ready to use! Login and explore all features.**
