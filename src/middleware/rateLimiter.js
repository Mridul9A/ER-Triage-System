const config = require('../config');

// Simple in-memory rate limiter
const requestCounts = {};

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  
  // Initialize or increment request count
  requestCounts[ip] = requestCounts[ip] || { count: 0, resetTime: Date.now() + config.RATE_LIMIT.windowMs };
  
  // Reset if time window has passed
  if (Date.now() > requestCounts[ip].resetTime) {
    requestCounts[ip] = { count: 1, resetTime: Date.now() + config.RATE_LIMIT.windowMs };
    return next();
  }
  
  // Check if limit exceeded
  if (requestCounts[ip].count >= config.RATE_LIMIT.max) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
  
  // Increment count and proceed
  requestCounts[ip].count++;
  next();
};

module.exports = rateLimiter;