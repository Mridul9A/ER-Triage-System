module.exports = {
    // Staffing configuration
    STAFF_THRESHOLD_RATIO: 3, // Alert when patient:staff ratio exceeds this value
    
    // Treatment time estimates (minutes)
    TREATMENT_TIMES: {
      1: 60,  // Level 1 - typically requires extended treatment
      2: 45,  // Level 2
      3: 30,  // Level 3
      4: 20,  // Level 4
      5: 15   // Level 5
    },
    
    // Rate limiting
    RATE_LIMIT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  };
  