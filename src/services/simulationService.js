const queueService = require('./queueService');

class SimulationService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.patientCounter = 0;
  }
  
  startSimulation() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Add patients at random intervals
    this.interval = setInterval(() => {
      this.addRandomPatient();
      
      // Randomly treat and discharge patients
      this.processRandomPatients();
    }, 1000); 
  }
  
  stopSimulation() {
    if (!this.isRunning) return;
    
    clearInterval(this.interval);
    this.isRunning = false;
    console.log('Stopping ER simulation mode');
  }
  
  addRandomPatient() {
    // Generate random patient
    this.patientCounter++;
    
    const triageLevel = this.getWeightedRandomTriageLevel();
    const symptoms = this.getRandomSymptoms(triageLevel);
    
    const patient = {
      name: `Patient ${this.patientCounter}`,
      age: Math.floor(Math.random() * 90) + 1,
      triageLevel,
      symptoms
    };
    
    // Add to queue
    queueService.addPatient(patient);
    console.log(`[Simulation] Added ${patient.name} with triage level ${triageLevel}`);
  }
  
  processRandomPatients() {
    // Get waiting patients
    const queue = queueService.getQueue();
    
    // Randomly start treating some patients
    if (queue.length > 0 && Math.random() > 0.3) {
      // Prioritize higher triage levels
      const patient = queue[0];
      try {
        queueService.startTreatment(patient.id);
        console.log(`[Simulation] Started treatment for ${patient.name}`);
      } catch (error) {
        // Handle full capacity
      }
    }
    
    // Randomly discharge some patients
    const treatingPatients = queueService.getAllPatients()
      .filter(p => p.status === 'treating');
    
    if (treatingPatients.length > 0 && Math.random() > 0.5) {
      const patient = treatingPatients[Math.floor(Math.random() * treatingPatients.length)];
      queueService.dischargePatient(patient.id);
      console.log(`[Simulation] Discharged ${patient.name}`);
    }
  }
  
  getWeightedRandomTriageLevel() {
    // Weighted distribution of triage levels
    // 10% Level 1, 20% Level 2, 30% Level 3, 25% Level 4, 15% Level 5
    const rand = Math.random();
    if (rand < 0.1) return 1;
    if (rand < 0.3) return 2;
    if (rand < 0.6) return 3;
    if (rand < 0.85) return 4;
    return 5;
  }
  
  getRandomSymptoms(triageLevel) {
    const symptoms = {
      1: [
        'Cardiac arrest', 'Severe trauma', 'Respiratory failure', 
        'Unconscious', 'Massive bleeding', 'Anaphylactic shock'
      ],
      2: [
        'Chest pain', 'Severe burns', 'Stroke symptoms', 
        'Major fractures', 'Severe allergic reaction', 'Severe infection'
      ],
      3: [
        'Moderate pain', 'Mild fractures', 'Dehydration', 
        'Persistent vomiting', 'Moderate bleeding', 'Moderate infection'
      ],
      4: [
        'Minor trauma', 'Fever', 'Earache', 
        'Mild pain', 'Cough', 'Sore throat'
      ],
      5: [
        'Cold symptoms', 'Minor rash', 'Medication refill', 
        'Minor cuts', 'Insect bites', 'General advice'
      ]
    };
    
    const levelSymptoms = symptoms[triageLevel];
    return levelSymptoms[Math.floor(Math.random() * levelSymptoms.length)];
  }
}

const simulationService = new SimulationService();
module.exports = simulationService;
