class NotificationService {
    constructor() {
      this.io = null;
    }
  
    initialize(io) {
      this.io = io;
    }
  
    notifyCriticalPatient(patient) {
      if (!this.io) return;
      
      this.io.emit('critical-patient', {
        message: `ALERT: Critical patient (Level 1) has arrived and needs immediate attention`,
        patient: {
          id: patient.id,
          name: patient.name,
          triageLevel: patient.triageLevel,
          symptoms: patient.symptoms
        }
      });
    }
  
    updateWaitTimes(waitTimeEstimates) {
      if (!this.io) return;
      
      this.io.emit('wait-time-update', {
        waitTimes: waitTimeEstimates,
        timestamp: Date.now()
      });
    }
  
    notifyStaffingThreshold(ratio, waitingPatients, availableStaff) {
      if (!this.io) return;
      
      this.io.emit('staffing-alert', {
        message: `ALERT: Patient-to-staff ratio exceeds safe levels`,
        details: {
          ratio,
          waitingPatients,
          availableStaff
        }
      });
    }
  
    notifyTreatmentInterruption(criticalPatient) {
      if (!this.io) return;
      
      this.io.emit('treatment-interrupt', {
        message: `URGENT: Level 1 emergency requires immediate staff attention, potentially interrupting current treatments`,
        patient: {
          id: criticalPatient.id,
          name: criticalPatient.name,
          symptoms: criticalPatient.symptoms
        }
      });
    }
  }
  
  const notificationService = new NotificationService();
  module.exports = notificationService;