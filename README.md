# Emergency Room Triage API

A Node.js RESTful API service that simulates the management of patient queues in an emergency room setting. This system implements a priority queue based on triage levels and provides real-time notifications for critical events.

## Features

- **Priority Queue System**
  - Patients sorted by triage level (1-5, with 1 being most critical)
  - Within same triage level, patients sorted by wait time
  - Critical cases (level 1) receive immediate attention

- **Real-time Notifications**
  - Critical patient alerts
  - Wait time estimates
  - Staffing threshold alerts

- **RESTful API Endpoints**
  - Add patients to the queue
  - View current queue
  - Move patients to treatment
  - Discharge patients

- **Additional Features**
  - Rate limiting to prevent API abuse
  - Logging middleware
  - Input validation
  - Simulation mode for testing

## Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/er-triage-api.git
   cd er-triage-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Development Mode

Run the application with automatic restart on file changes:
```bash
npm run dev
```

## Simulation Mode

Start the application with automatic patient generation for testing:
```bash
npm run simulation
```

## API Endpoints

### Add a Patient
- **URL**: `/api/patients`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "age": 45,
    "triageLevel": 3,
    "symptoms": "Broken arm, moderate pain"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Patient added to queue",
    "patient": {
      "id": "1617304884123",
      "name": "John Doe",
      "age": 45,
      "triageLevel": 3,
      "symptoms": "Broken arm, moderate pain",
      "arrivalTime": 1617304884123,
      "status": "waiting",
      "treatmentStartTime": null,
      "dischargeTime": null
    }
  }
  ```

### Get Queue
- **URL**: `/api/patients?status=waiting`
- **Method**: `GET`
- **Query Parameters**: 
  - `status` (optional): Filter patients by status (waiting/treating/discharged)
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "patients": [
      {
        "id": "1617304884123",
        "name": "John Doe",
        "age": 45,
        "triageLevel": 3,
        "symptoms": "Broken arm, moderate pain",
        "arrivalTime": 1617304884123,
        "status": "waiting",
        "treatmentStartTime": null,
        "dischargeTime": null
      },
      {
        "id": "1617304892456",
        "name": "Jane Smith",
        "age": 60,
        "triageLevel": 4,
        "symptoms": "Fever, cough",
        "arrivalTime": 1617304892456,
        "status": "waiting",
        "treatmentStartTime": null,
        "dischargeTime": null
      }
    ]
  }
  ```

### Start Treatment
- **URL**: `/api/patients/:id/treat`
- **Method**: `PUT`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Patient treatment started",
    "patient": {
      "id": "1617304884123",
      "name": "John Doe",
      "age": 45,
      "triageLevel": 3,
      "symptoms": "Broken arm, moderate pain",
      "arrivalTime": 1617304884123,
      "status": "treating",
      "treatmentStartTime": 1617305000123,
      "dischargeTime": null
    }
  }
  ```

### Discharge Patient
- **URL**: `/api/patients/:id/discharge`
- **Method**: `PUT`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Patient discharged",
    "patient": {
      "id": "1617304884123",
      "name": "John Doe",
      "age": 45,
      "triageLevel": 3,
      "symptoms": "Broken arm, moderate pain",
      "arrivalTime": 1617304884123,
      "status": "discharged",
      "treatmentStartTime": 1617305000123,
      "dischargeTime": 1617308600123
    }
  }
  ```

### Get Wait Times
- **URL**: `/api/patients/wait-times`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "waitTimes": [
      {
        "patientId": "1617304884123",
        "currentWaitTime": 45,
        "estimatedRemainingWait": 15
      },
      {
        "patientId": "1617304892456",
        "currentWaitTime": 40,
        "estimatedRemainingWait": 90
      }
    ]
  }
  ```

### Update Staffing Levels
- **URL**: `/api/patients/staffing`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "count": 8
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Staffing levels updated",
    "staffAvailable": 8
  }
  ```

## Real-time Events

The API uses Socket.io for real-time communication. Connect to the WebSocket endpoint to receive these events:

- **critical-patient**: When a level 1 patient arrives
- **wait-time-update**: When wait times are recalculated
- **staffing-alert**: When patient-to-staff ratio exceeds safe levels
- **treatment-interrupt**: When a critical patient requires immediate attention

Example of connecting to the WebSocket:

```javascript
const socket = io('http://localhost:3000');

socket.on('critical-patient', (data) => {
  console.log('Critical patient alert:', data);
});

socket.on('wait-time-update', (data) => {
  console.log('Wait time update:', data);
});

socket.on('staffing-alert', (data) => {
  console.log('Staffing alert:', data);
});

socket.on('treatment-interrupt', (data) => {
  console.log('Treatment interruption alert:', data);
});
```

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
er-triage-api/
├── server.js                  # Application entry point
├── package.json               # Project configuration
├── src/
│   ├── config.js              # Application configuration
│   ├── models/
│   │   └── Patient.js         # Patient data model
│   ├── services/
│   │   ├── queueService.js    # Patient queue logic
│   │   ├── notificationService.js # Real-time notifications
│   │   └── simulationService.js   # Simulation mode
│   ├── routes/
│   │   └── patientRoutes.js   # API endpoints
│   ├── middleware/
│   │   ├── logger.js          # Request logging
│   │   ├── validation.js      # Input validation
│   │   ├── rateLimiter.js     # API rate limiting
│   │   └── errorHandler.js    # Error handling
│   └── utils/                 # Helper utilities
└── tests/
    └── queueService.test.js   # Unit tests
```

## License

MIT