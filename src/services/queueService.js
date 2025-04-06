const Patient = require('../models/Patient');
const notificationService = require('./notificationService');
const config = require('../config');

class QueueService {
  constructor() {
    this.patients = []; // All patients in the system
    this.staffAvailable = 5; // Default available staff
    this.currentlyTreating = 0; // Number of patients currently being treated
  }

  // Add a patient to the queue
  addPatient(patientData) {
    const { name, age, triageLevel, symptoms } = patientData;
    
    // Input validation
    if (!name || !age || !triageLevel || !symptoms) {
      throw new Error('Missing required patient information');
    }
    
    if (triageLevel < 1 || triageLevel > 5) {
      throw new Error('Triage level must be between 1 and 5');
    }
    
    const id = Date.now().toString();
    const patient = new Patient(id, name, age, triageLevel, symptoms);
    this.patients.push(patient);
    
    // Check if critical patient and send notification
    if (triageLevel === 1) {
      notificationService.notifyCriticalPatient(patient);
      
      // Potentially interrupt current treatments for level 1 emergency
      this.checkForCriticalInterruption(patient);
    }
    
    // Check staffing levels
    this.checkStaffingThreshold();
    
    // Calculate and update wait times
    this.updateWaitTimeEstimates();
    
    return patient;
  }

  // Get all patients in the queue sorted by priority
  getQueue() {
    return [...this.patients]
      .filter(p => p.status === 'waiting')
      .sort((a, b) => {
        // Sort by triage level (most critical first)
        if (a.triageLevel !== b.triageLevel) {
          return a.triageLevel - b.triageLevel;
        }
        // Within same triage level, sort by wait time (longest first)
        return a.arrivalTime - b.arrivalTime;
      });
  }

  // Get all patients (waiting, treating, discharged)
  getAllPatients() {
    return this.patients;
  }

  // Start treating a patient
  startTreatment(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    if (patient.status !== 'waiting') {
      throw new Error('Patient is not in waiting status');
    }
    
    // Check if staff available
    if (this.currentlyTreating >= this.staffAvailable) {
      throw new Error('No staff available to treat patient');
    }
    
    patient.startTreatment();
    this.currentlyTreating++;
    
    // Update wait times after state change
    this.updateWaitTimeEstimates();
    
    return patient;
  }

  // Discharge a patient
  dischargePatient(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    if (patient.status === 'discharged') {
      throw new Error('Patient already discharged');
    }
    
    // If was in treatment, free up staff
    if (patient.status === 'treating') {
      this.currentlyTreating--;
    }
    
    patient.discharge();
    
    // Update wait times after state change
    this.updateWaitTimeEstimates();
    
    return patient;
  }

  // Update staffing levels
  updateStaffing(count) {
    this.staffAvailable = count;
    this.checkStaffingThreshold();
    this.updateWaitTimeEstimates();
  }

  // Check if staffing thresholds are exceeded
  checkStaffingThreshold() {
    const waitingPatients = this.patients.filter(p => p.status === 'waiting').length;
    
    // Calculate patient-to-staff ratio
    const ratio = waitingPatients / this.staffAvailable;
    
    if (ratio > config.STAFF_THRESHOLD_RATIO) {
      notificationService.notifyStaffingThreshold(ratio, waitingPatients, this.staffAvailable);
    }
  }

  // Check if level 1 patient needs to interrupt current treatments
  checkForCriticalInterruption(criticalPatient) {
    // Logic for handling level 1 emergencies
    // In a real system, this might trigger a specific alert protocol
    notificationService.notifyTreatmentInterruption(criticalPatient);
  }

  // Calculate and update wait time estimates
  updateWaitTimeEstimates() {
    const waitingQueue = this.getQueue();
    
    // Simple wait estimation algorithm:
    // - Level 1: Immediate (0-5 min)
    // - Level 2: 5-15 min
    // - Level 3: 15-60 min
    // - Level 4: 1-2 hours
    // - Level 5: 2-4 hours
    // Modified by current queue length and staff availability
    
    const waitTimeEstimates = waitingQueue.map(patient => {
      let baseWaitTime = 0;
      
      switch (patient.triageLevel) {
        case 1: baseWaitTime = 2; break; // 2 minutes
        case 2: baseWaitTime = 10; break; // 10 minutes
        case 3: baseWaitTime = 30; break; // 30 minutes
        case 4: baseWaitTime = 90; break; // 1.5 hours
        case 5: baseWaitTime = 180; break; // 3 hours
      }
      
      // Adjust for current queue conditions
      const queueFactor = waitingQueue.length / this.staffAvailable;
      const adjustedWaitTime = Math.ceil(baseWaitTime * queueFactor);
      
      return {
        patientId: patient.id,
        currentWaitTime: patient.getWaitTime(),
        estimatedRemainingWait: adjustedWaitTime
      };
    });
    
    // Broadcast wait time updates
    notificationService.updateWaitTimes(waitTimeEstimates);
    
    return waitTimeEstimates;
  }
}

// Singleton instance
const queueService = new QueueService();
module.exports = queueService;
