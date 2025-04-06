const assert = require('assert');
const QueueService = require('../src/services/queueService');
const Patient = require('../src/models/Patient');

// Mock notificationService to avoid socket.io dependency in tests
jest.mock('../src/services/notificationService', () => ({
  notifyCriticalPatient: jest.fn(),
  updateWaitTimes: jest.fn(),
  notifyStaffingThreshold: jest.fn(),
  notifyTreatmentInterruption: jest.fn()
}));

describe('QueueService', () => {
  let queueService;

  beforeEach(() => {
    // Create a fresh instance for each test
    queueService = new QueueService();
  });

  test('should add a patient to the queue', () => {
    const patient = queueService.addPatient({
      name: 'John Doe',
      age: 45,
      triageLevel: 3,
      symptoms: 'Broken arm'
    });

    expect(patient).toBeDefined();
    expect(patient.name).toBe('John Doe');
    expect(patient.status).toBe('waiting');
    expect(queueService.patients.length).toBe(1);
  });

  test('should sort patients by triage level', () => {
    // Add patients in reverse priority order
    queueService.addPatient({
      name: 'Low Priority',
      age: 30,
      triageLevel: 5,
      symptoms: 'Minor cut'
    });

    queueService.addPatient({
      name: 'Medium Priority',
      age: 40,
      triageLevel: 3,
      symptoms: 'Sprained ankle'
    });

    queueService.addPatient({
      name: 'High Priority',
      age: 50,
      triageLevel: 1,
      symptoms: 'Chest pain'
    });

    const queue = queueService.getQueue();
    
    // Queue should be sorted by priority (1 first, 5 last)
    expect(queue.length).toBe(3);
    expect(queue[0].name).toBe('High Priority');
    expect(queue[1].name).toBe('Medium Priority');
    expect(queue[2].name).toBe('Low Priority');
  });

  test('should sort patients by wait time within same triage level', () => {
    // Add two patients with the same triage level
    const patient1 = queueService.addPatient({
      name: 'First Arrival',
      age: 35,
      triageLevel: 3,
      symptoms: 'Fever'
    });

    // Simulate time passing
    jest.advanceTimersByTime(1000 * 60 * 10); // 10 minutes

    const patient2 = queueService.addPatient({
      name: 'Second Arrival',
      age: 40,
      triageLevel: 3,
      symptoms: 'Headache'
    });

    const queue = queueService.getQueue();
    
    // First arrival should be first in queue (within same triage level)
    expect(queue.length).toBe(2);
    expect(queue[0].name).toBe('First Arrival');
    expect(queue[1].name).toBe('Second Arrival');
  });

  test('should change patient status when treatment starts', () => {
    const patient = queueService.addPatient({
      name: 'Test Patient',
      age: 25,
      triageLevel: 2,
      symptoms: 'Severe pain'
    });

    queueService.startTreatment(patient.id);
    
    expect(patient.status).toBe('treating');
    expect(patient.treatmentStartTime).not.toBeNull();
    expect(queueService.currentlyTreating).toBe(1);
  });

  test('should discharge patients correctly', () => {
    const patient = queueService.addPatient({
      name: 'Discharge Test',
      age: 60,
      triageLevel: 4,
      symptoms: 'Minor pain'
    });

    queueService.startTreatment(patient.id);
    queueService.dischargePatient(patient.id);
    
    expect(patient.status).toBe('discharged');
    expect(patient.dischargeTime).not.toBeNull();
    expect(queueService.currentlyTreating).toBe(0);
  });

  test('should throw error when treating non-existent patient', () => {
    expect(() => {
      queueService.startTreatment('invalid-id');
    }).toThrow('Patient not found');
  });

  test('should throw error when staff capacity is reached', () => {
    // Set available staff to 1
    queueService.staffAvailable = 1;
    
    const patient1 = queueService.addPatient({
      name: 'Patient 1',
      age: 30,
      triageLevel: 3,
      symptoms: 'Symptoms 1'
    });

    const patient2 = queueService.addPatient({
      name: 'Patient 2',
      age: 40,
      triageLevel: 3,
      symptoms: 'Symptoms 2'
    });

    // Start treatment for first patient
    queueService.startTreatment(patient1.id);
    
    // Second patient should not be able to start treatment
    expect(() => {
      queueService.startTreatment(patient2.id);
    }).toThrow('No staff available to treat patient');
  });

  test('should prioritize critical patients', () => {
    // Add several patients with different priorities
    queueService.addPatient({
      name: 'Normal Patient 1',
      age: 30,
      triageLevel: 4,
      symptoms: 'Minor symptoms'
    });
    
    queueService.addPatient({
      name: 'Normal Patient 2',
      age: 35,
      triageLevel: 3,
      symptoms: 'Moderate symptoms'
    });
    
    // Add critical patient
    const criticalPatient = queueService.addPatient({
      name: 'Critical Patient',
      age: 50,
      triageLevel: 1,
      symptoms: 'Life-threatening symptoms'
    });
    
    const queue = queueService.getQueue();
    
    // Critical patient should be first
    expect(queue[0].id).toBe(criticalPatient.id);
    
    // Notification service should have been called
    expect(notificationService.notifyCriticalPatient).toHaveBeenCalledWith(criticalPatient);
  });
});