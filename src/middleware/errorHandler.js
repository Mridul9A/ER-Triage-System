const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'An unexpected error occurred'
    });
  };
  
  module.exports = errorHandler;