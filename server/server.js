const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const {
  apiLimiter,
  sanitizeInput,
  validateCSRF,
  preventParameterPollution,
  securityHeaders,
  logSuspiciousActivity
} = require('./middleware/security');

const app = express();

// Trust proxy - required for rate limiting behind proxies/load balancers
app.set('trust proxy', 1);

// Middleware - Applied in order of execution
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use(securityHeaders);

// Helmet - Secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration for production and development
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// MongoDB sanitization - Prevent NoSQL injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  SECURITY: Sanitized key "${key}" in request from ${req.ip}`);
  }
}));

// Input sanitization and validation
app.use(sanitizeInput);
app.use(preventParameterPollution);
app.use(logSuspiciousActivity);

// CSRF validation for state-changing operations
app.use(validateCSRF);

// General API rate limiting
app.use('/api/', apiLimiter);

// Database connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';

const PORT = process.env.PORT || 5000;

// Make query behavior predictable
mongoose.set('strictQuery', false);

// Routes - Register BEFORE starting server
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/gate', require('./routes/gate'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/kra', require('./routes/kra'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server function with retry logic
async function startServer() {
	const maxRetries = 3;
	let retries = 0;
	
	while (retries < maxRetries) {
		try {
			console.log('\n🔗 Attempting MongoDB Connection...');
			
			// Close any existing connections first
			if (mongoose.connection.readyState !== 0) {
				await mongoose.connection.close();
			}
			
			await mongoose.connect(mongoURI, {
				serverSelectionTimeoutMS: 15000,
				connectTimeoutMS: 15000,
				socketTimeoutMS: 45000,
			});
			
			console.log('✅ MongoDB Connected Successfully');
			console.log(`📊 Connected to: ${mongoose.connection.host}`);
			console.log(`🗄️  Database name: ${mongoose.connection.name}\n`);
			
			// Start Express server AFTER MongoDB connection succeeds
			app.listen(PORT, () => {
				console.log(`🚀 Server running on port ${PORT}`);
				console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
				console.log(`🌐 API: http://localhost:${PORT}/api\n`);
			});
			
			break; // Success, exit retry loop
			
		} catch (err) {
			retries++;
			console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}):`, err.message);
			
			if (retries >= maxRetries) {
				console.log('\n💡 TROUBLESHOOTING:');
				console.log('1. Check your MONGODB_URI in .env file');
				console.log('2. Verify cluster is running on MongoDB Atlas');
				console.log('3. Check IP whitelist (0.0.0.0/0)');
				console.log('4. Wait a few seconds and restart the server\n');
				process.exit(1);
			}
			
			// Wait before retry
			console.log(`⏳ Retrying in 2 seconds...\n`);
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n\n🛑 Shutting down gracefully...');
	await mongoose.connection.close();
	console.log('✅ MongoDB connection closed');
	process.exit(0);
});

// Start the server
startServer();
