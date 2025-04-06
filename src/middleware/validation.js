function validatePatient(req, res, next) {
    const { name, age, triageLevel, symptoms } = req.body;
    const errors = [];
  
    // Check required fields
    if (!name) errors.push('Patient name is required');
    if (!age) errors.push('Patient age is required');
    if (!triageLevel) errors.push('Triage level is required');
    if (!symptoms) errors.push('Symptoms are required');
  
    // Validate field formats
    if (age && (isNaN(age) || age < 0 || age > 120)) {
      errors.push('Age must be a number between 0 and 120');
    }
    
    if (triageLevel && (isNaN(triageLevel) || triageLevel < 1 || triageLevel > 5)) {
      errors.push('Triage level must be a number between 1 and 5');
    }
    
    if (symptoms && (typeof symptoms !== 'string' || symptoms.length < 3)) {
      errors.push('Symptoms must be a descriptive string');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors 
      });
    }
  
    next();
  }
  
  module.exports = { validatePatient };