const logger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log request details
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    // Process request
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  };
  
  module.exports = logger;