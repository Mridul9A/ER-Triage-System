class Patient {
    constructor(id, name, age, triageLevel, symptoms) {
      this.id = id;
      this.name = name;
      this.age = age;
      this.triageLevel = triageLevel; // 1-5, where 1 is most critical
      this.symptoms = symptoms;
      this.arrivalTime = Date.now();
      this.status = 'waiting'; // waiting, treating, discharged
      this.treatmentStartTime = null;
      this.dischargeTime = null;
    }
  
    getWaitTime() {
      return Math.floor((Date.now() - this.arrivalTime) / 1000 / 60); // minutes
    }
  
    startTreatment() {
      this.status = 'treating';
      this.treatmentStartTime = Date.now();
    }
  
    discharge() {
      this.status = 'discharged';
      this.dischargeTime = Date.now();
    }
  }
  
  module.exports = Patient;