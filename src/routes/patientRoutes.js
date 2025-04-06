const express = require('express');
const router = express.Router();
const queueService = require('../services/queueService');
const { validatePatient } = require('../middleware/validation');

// Get all patients
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let patients;
    
    if (status === 'waiting') {
      patients = queueService.getQueue();
    } else {
      patients = queueService.getAllPatients();
      
      // Filter by status if provided
      if (status) {
        patients = patients.filter(p => p.status === status);
      }
    }
    
    res.json({ 
      success: true, 
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new patient
router.post('/', validatePatient, (req, res) => {
  try {
    const patient = queueService.addPatient(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Patient added to queue',
      patient
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start treating a patient
router.put('/:id/treat', (req, res) => {
  try {
    const patient = queueService.startTreatment(req.params.id);
    res.json({ 
      success: true, 
      message: 'Patient treatment started',
      patient
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Discharge a patient
router.put('/:id/discharge', (req, res) => {
  try {
    const patient = queueService.dischargePatient(req.params.id);
    res.json({ 
      success: true, 
      message: 'Patient discharged',
      patient
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get wait time estimates
router.get('/wait-times', (req, res) => {
  try {
    const waitTimes = queueService.updateWaitTimeEstimates();
    res.json({ 
      success: true, 
      waitTimes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update staffing levels
router.put('/staffing', (req, res) => {
  try {
    const { count } = req.body;
    
    if (!count || count < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid staffing count' 
      });
    }
    
    queueService.updateStaffing(count);
    res.json({ 
      success: true, 
      message: 'Staffing levels updated',
      staffAvailable: count
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;