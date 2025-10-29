require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Course = require('./models/Course');
const Unit = require('./models/Unit');
const Timetable = require('./models/Timetable');
const Assignment = require('./models/Assignment');
const Performance = require('./models/Performance');
const Fee = require('./models/Fee');
const Quote = require('./models/Quote');
const Notification = require('./models/Notification');

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file');
  console.log('\n📝 Please create server/.env file with:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management?retryWrites=true&w=majority\n');
  process.exit(1);
}

async function seedDatabase() {
    let connection;
    try {
        console.log('🔗 Attempting MongoDB Connection (seed)...');
        connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log('📍 Database: MongoDB Atlas (Cloud)');
        console.log('✅ MongoDB Connected Successfully for seeding');
        console.log('📊 Connected to:', mongoose.connection.host);
        console.log('🗄️  Database name:', mongoose.connection.name);

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Unit.deleteMany({}),
            Timetable.deleteMany({}),
            Assignment.deleteMany({}),
            Performance.deleteMany({}),
            Fee.deleteMany({}),
            Quote.deleteMany({}),
            Notification.deleteMany({})
        ]);

        console.log('Cleared existing data...');

        // Create Courses
        const courses = await Course.insertMany([
          {
            name: 'Diploma in Information Technology',
            code: 'DIT',
            description: 'Comprehensive IT program covering software development, networking, and databases',
            duration: '3 Years',
            level: 'Level 6',
            department: 'ICT'
          },
          {
            name: 'Certificate in Business Management',
            code: 'CBM',
            description: 'Business fundamentals and management principles',
            duration: '2 Years',
            level: 'Level 4',
            department: 'Business'
          },
          {
            name: 'Diploma in Electrical Engineering',
            code: 'DEE',
            description: 'Electrical systems, power distribution, and electronics',
            duration: '3 Years',
            level: 'Level 6',
            department: 'Engineering'
          },
          {
            name: 'Certificate in Computer Applications',
            code: 'CCA',
            description: 'Basic computer skills and office productivity applications',
            duration: '1 Year',
            level: 'Level 4',
            department: 'ICT'
          },
          {
            name: 'Diploma in Business Management',
            code: 'DBM',
            description: 'Advanced business administration and entrepreneurship',
            duration: '2 Years',
            level: 'Level 5',
            department: 'Business'
          }
        ]);

        console.log('Courses created...');

        // Create Users
        const admin = await User.create({
          name: 'Admin User',
          email: 'admin@school.com',
          password: 'admin123',
          role: 'admin',
          passwordSet: true,
          firstLogin: false
        });

        const teacher = await User.create({
          name: 'John Teacher',
          email: 'teacher@school.com',
          password: 'teacher123',
          role: 'teacher',
          accountCode: '123456',
          course: courses[0]._id,
          passwordSet: true,
          firstLogin: false,
          createdBy: admin._id
        });

        const student = await User.create({
          name: 'Jane Student',
          firstName: 'Jane',
          lastName: 'Student',
          email: 'student@school.com',
          password: 'student123',
          role: 'student',
          admissionNumber: 'STD2024001',
          course: courses[0]._id,
          level: 'Level 1',
          phone: '0712345678',
          countyOfBirth: 'Nairobi',
          dateOfBirth: new Date('2003-05-15'),
          passwordSet: true,
          firstLogin: false
        });

        const finance = await User.create({
          name: 'Finance Officer',
          email: 'finance@school.com',
          password: 'finance123',
          role: 'finance',
          accountId: '1234567',
          passwordSet: true,
          firstLogin: false,
          createdBy: admin._id
        });

        const gateVerification = await User.create({
          name: 'Gate Keeper',
          email: 'gate@school.com',
          password: 'gate123',
          role: 'gateverification',
          accountId: '12345',
          passwordSet: true,
          firstLogin: false,
          createdBy: admin._id
        });

        const enrollment = await User.create({
          name: 'Enrollment Officer',
          email: 'enrollment@school.com',
          password: 'enrollment123',
          role: 'enrollment',
          accountId: '1234',
          passwordSet: true,
          firstLogin: false,
          createdBy: admin._id
        });

        console.log('Users created...');

        // Create Units
        const units = await Unit.insertMany([
          {
            name: 'Introduction to Programming',
            code: 'ICT101',
            course: courses[0]._id,
            level: 'Level 1',
            teacher: teacher._id,
            credits: 4,
            description: 'Basic programming concepts using Python'
          },
          {
            name: 'Database Management Systems',
            code: 'ICT102',
            course: courses[0]._id,
            level: 'Level 1',
            teacher: teacher._id,
            credits: 4,
            description: 'Introduction to databases and SQL'
          },
          {
            name: 'Computer Networks',
            code: 'ICT103',
            course: courses[0]._id,
            level: 'Level 1',
            teacher: teacher._id,
            credits: 3,
            description: 'Networking fundamentals and protocols'
          },
          {
            name: 'Web Development',
            code: 'ICT104',
            course: courses[0]._id,
            level: 'Level 1',
            teacher: teacher._id,
            credits: 4,
            description: 'HTML, CSS, JavaScript and modern web frameworks'
          },
          {
            name: 'Mathematics for IT',
            code: 'ICT105',
            course: courses[0]._id,
            level: 'Level 1',
            teacher: teacher._id,
            credits: 3,
            description: 'Discrete mathematics and statistics'
          }
        ]);

        console.log('Units created...');

        // Create Timetable
        await Timetable.create({
          course: courses[0]._id,
          level: 'Level 1',
          schedule: [
            {
              day: 'Monday',
              time: '8:00 AM - 10:00 AM',
              unit: units[0]._id,
              teacher: teacher._id,
              venue: 'Lab 1'
            },
            {
              day: 'Monday',
              time: '10:30 AM - 12:30 PM',
              unit: units[1]._id,
              teacher: teacher._id,
              venue: 'Lab 2'
            },
            {
              day: 'Tuesday',
              time: '8:00 AM - 10:00 AM',
              unit: units[2]._id,
              teacher: teacher._id,
              venue: 'Room 101'
            },
            {
              day: 'Tuesday',
              time: '10:30 AM - 12:30 PM',
              unit: units[3]._id,
              teacher: teacher._id,
              venue: 'Lab 1'
            },
            {
              day: 'Wednesday',
              time: '8:00 AM - 10:00 AM',
              unit: units[4]._id,
              teacher: teacher._id,
              venue: 'Room 102'
            },
            {
              day: 'Thursday',
              time: '8:00 AM - 10:00 AM',
              unit: units[0]._id,
              teacher: teacher._id,
              venue: 'Lab 1'
            },
            {
              day: 'Friday',
              time: '8:00 AM - 10:00 AM',
              unit: units[3]._id,
              teacher: teacher._id,
              venue: 'Lab 1'
            }
          ],
          semester: 'Semester 1',
          academicYear: '2024/2025',
          isActive: true
        });

        console.log('Timetable created...');

        // Create Assignments
        await Assignment.insertMany([
          {
            title: 'Python Basics Assignment',
            description: 'Complete exercises on variables, loops, and functions',
            unit: units[0]._id,
            teacher: teacher._id,
            course: courses[0]._id,
            level: 'Level 1',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalMarks: 20
          },
          {
            title: 'Database Design Project',
            description: 'Design a database schema for a library management system',
            unit: units[1]._id,
            teacher: teacher._id,
            course: courses[0]._id,
            level: 'Level 1',
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            totalMarks: 30
          }
        ]);

        console.log('Assignments created...');

        // Create Performance Records
        await Performance.insertMany([
          {
            student: student._id,
            unit: units[0]._id,
            assessments: [
              { type: 'CAT', score: 18, maxScore: 20, date: new Date(), remarks: 'Good work' },
              { type: 'Assignment', score: 15, maxScore: 20, date: new Date(), remarks: 'Well done' }
            ],
            totalScore: 82.5,
            grade: 'A',
            semester: 'Semester 1',
            academicYear: '2024/2025'
          },
          {
            student: student._id,
            unit: units[1]._id,
            assessments: [
              { type: 'CAT', score: 16, maxScore: 20, date: new Date(), remarks: 'Keep it up' },
              { type: 'Assignment', score: 17, maxScore: 20, date: new Date(), remarks: 'Excellent' }
            ],
            totalScore: 85,
            grade: 'A',
            semester: 'Semester 1',
            academicYear: '2024/2025'
          },
          {
            student: student._id,
            unit: units[2]._id,
            assessments: [
              { type: 'CAT', score: 14, maxScore: 20, date: new Date(), remarks: 'Good' }
            ],
            totalScore: 70,
            grade: 'B',
            semester: 'Semester 1',
            academicYear: '2024/2025'
          },
          {
            student: student._id,
            unit: units[3]._id,
            assessments: [
              { type: 'CAT', score: 19, maxScore: 20, date: new Date(), remarks: 'Outstanding' }
            ],
            totalScore: 95,
            grade: 'A',
            semester: 'Semester 1',
            academicYear: '2024/2025'
          }
        ]);

        console.log('Performance records created...');

        // Create Fee Records
        await Fee.create({
          student: student._id,
          totalAmount: 50000,
          amountPaid: 35000,
          balance: 15000,
          semester: 'Semester 1',
          academicYear: '2024/2025',
          payments: [
            {
              amount: 20000,
              date: new Date('2024-09-01'),
              receiptNumber: 'RCP001',
              paymentMethod: 'Bank Transfer',
              processedBy: finance._id
            },
            {
              amount: 15000,
              date: new Date('2024-10-01'),
              receiptNumber: 'RCP002',
              paymentMethod: 'M-Pesa',
              processedBy: finance._id
            }
          ],
          status: 'Partial',
          dueDate: new Date('2024-12-31')
        });

        console.log('Fee records created...');

        // Create Daily Quotes
        await Quote.insertMany([
          {
            text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
            author: "Malcolm X",
            dayOfWeek: 0, // Sunday
            category: 'motivation'
          },
          {
            text: "The beautiful thing about learning is that no one can take it away from you.",
            author: "B.B. King",
            dayOfWeek: 1, // Monday
            category: 'motivation'
          },
          {
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill",
            dayOfWeek: 2, // Tuesday
            category: 'motivation'
          },
          {
            text: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt",
            dayOfWeek: 3, // Wednesday
            category: 'motivation'
          },
          {
            text: "The expert in anything was once a beginner.",
            author: "Helen Hayes",
            dayOfWeek: 4, // Thursday
            category: 'motivation'
          },
          {
            text: "Your education is a dress rehearsal for a life that is yours to lead.",
            author: "Nora Ephron",
            dayOfWeek: 5, // Friday
            category: 'motivation'
          },
          {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            dayOfWeek: 6, // Saturday
            category: 'motivation'
          },
          // Teacher Quotes
          {
            text: "Teaching is the one profession that creates all other professions.",
            author: "Unknown",
            dayOfWeek: 0, // Sunday
            category: 'teacher'
          },
          {
            text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
            author: "Brad Henry",
            dayOfWeek: 1, // Monday
            category: 'teacher'
          },
          {
            text: "The art of teaching is the art of assisting discovery.",
            author: "Mark Van Doren",
            dayOfWeek: 2, // Tuesday
            category: 'teacher'
          },
          {
            text: "Education is not the filling of a pail, but the lighting of a fire.",
            author: "William Butler Yeats",
            dayOfWeek: 3, // Wednesday
            category: 'teacher'
          },
          {
            text: "Teachers can change lives with just the right mix of chalk and challenges.",
            author: "Joyce Meyer",
            dayOfWeek: 4, // Thursday
            category: 'teacher'
          },
          {
            text: "The influence of a good teacher can never be erased.",
            author: "Unknown",
            dayOfWeek: 5, // Friday
            category: 'teacher'
          },
          {
            text: "To teach is to touch a life forever.",
            author: "Unknown",
            dayOfWeek: 6, // Saturday
            category: 'teacher'
          }
        ]);

        console.log('Quotes created...');

        // Create Sample Notifications
        await Notification.insertMany([
          {
            recipient: student._id,
            sender: teacher._id,
            type: 'assignment',
            title: 'New Assignment Posted',
            message: 'A new assignment has been posted for Introduction to Programming',
            priority: 'high'
          },
          {
            recipient: student._id,
            sender: finance._id,
            type: 'fee',
            title: 'Fee Balance Reminder',
            message: 'You have a pending fee balance of KES 15,000',
            priority: 'high'
          },
          {
            recipient: student._id,
            sender: admin._id,
            type: 'general',
            title: 'Welcome to the New Semester',
            message: 'We wish you all the best in this academic year!',
            priority: 'medium'
          }
        ]);

        console.log('Notifications created...');

        console.log('\n✅ Database seeded successfully!\n');
        console.log('='.repeat(70));
        console.log('                  DEFAULT LOGIN CREDENTIALS');
        console.log('='.repeat(70));
        console.log('\n📧 ADMIN (Email Login):');
        console.log('   Email: admin@school.com');
        console.log('   Password: admin123');
        console.log('   → Use for managing entire system\n');
        console.log('👨‍🎓 STUDENT (Admission Number + Course):');
        console.log('   Admission No: STD2024001');
        console.log('   Course: Diploma in Information Technology');
        console.log('   Password: student123');
        console.log('   → Use admission number + course to login\n');
        console.log('👨‍🏫 TEACHER (6-digit Code):');
        console.log('   Account Code: 123456');
        console.log('   Password: teacher123');
        console.log('   → Use 6-digit code to login\n');
        console.log('💰 FINANCE (7-digit ID):');
        console.log('   Account ID: 1234567');
        console.log('   Password: finance123');
        console.log('   → Use 7-digit ID to login\n');
        console.log('🚪 GATE VERIFICATION (5-digit ID):');
        console.log('   Account ID: 12345');
        console.log('   Password: gate123');
        console.log('   → Use 5-digit ID to login\n');
        console.log('📝 ENROLLMENT (4-digit ID):');
        console.log('   Account ID: 1234');
        console.log('   Password: enrollment123');
        console.log('   → Use 4-digit ID to login\n');
        console.log('='.repeat(70));
        console.log('🌐 Application URL: http://localhost:3000');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (connection) {
            await connection.disconnect();
            console.log('📍 Disconnected from MongoDB');
        }
    }
    process.exit(0);
}

// Run the seed function
seedDatabase();
