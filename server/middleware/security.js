const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests too
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

// Moderate rate limiter for password reset (prevent abuse)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset requests, please try again after 1 hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS or injection attempts from string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential script tags and SQL injection patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// CSRF token validation middleware (for state-changing operations)
const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // In production with separate frontend, we use origin checking instead of CSRF tokens
  const origin = req.get('origin') || req.get('referer');
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean);

  // Allow requests without origin (e.g., mobile apps, Postman in dev)
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Origin header required' });
    }
    return next();
  }

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    if (!allowed) return false;
    const originUrl = new URL(origin);
    const allowedUrl = new URL(allowed);
    return originUrl.origin === allowedUrl.origin;
  });

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Invalid origin' });
  }

  next();
};

// Prevent parameter pollution
const preventParameterPollution = (req, res, next) => {
  // Ensure query params are not arrays (except for allowed params)
  const allowedArrayParams = ['tags', 'categories', 'ids']; // Add your allowed array params
  
  for (const key in req.query) {
    if (Array.isArray(req.query[key]) && !allowedArrayParams.includes(key)) {
      req.query[key] = req.query[key][0]; // Take only first value
    }
  }
  
  next();
};

// Security headers middleware (additional to helmet)
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Prevent timing attacks on password comparison
const constantTimeDelay = (req, res, next) => {
  // Add small random delay to prevent timing attacks
  const delay = Math.floor(Math.random() * 50) + 50; // 50-100ms
  setTimeout(next, delay);
};

// Log suspicious activity (for monitoring)
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection patterns
    /<script|javascript:|onerror=/i, // XSS patterns
    /\.\.\//i, // Path traversal
    /union.*select/i, // SQL union
  ];

  const checkSuspicious = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  let suspicious = false;
  
  // Check all inputs
  for (const key in req.body) {
    if (checkSuspicious(req.body[key])) {
      suspicious = true;
      break;
    }
  }
  
  for (const key in req.query) {
    if (checkSuspicious(req.query[key])) {
      suspicious = true;
      break;
    }
  }

  if (suspicious) {
    console.warn(`⚠️  SECURITY: Suspicious request detected from ${req.ip}`);
    console.warn(`   Method: ${req.method}, Path: ${req.path}`);
    console.warn(`   User-Agent: ${req.get('user-agent')}`);
    
    // In production, you might want to block the request
    if (process.env.NODE_ENV === 'production' && process.env.BLOCK_SUSPICIOUS === 'true') {
      return res.status(400).json({ message: 'Invalid request' });
    }
  }

  next();
};

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  sanitizeInput,
  validateCSRF,
  preventParameterPollution,
  securityHeaders,
  validateRequest,
  constantTimeDelay,
  logSuspiciousActivity
};
