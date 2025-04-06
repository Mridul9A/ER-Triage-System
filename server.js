const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const patientRoutes = require('./src/routes/patientRoutes');
const logger = require('./src/middleware/logger');
const rateLimit = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');
const simulationService = require('./src/services/simulationService');
const notificationService = require('./src/services/notificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(logger);
app.use(rateLimit);

// Route initialization
app.use('/api/patients', patientRoutes);

// Socket.io setup for real-time communications
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Expose socket.io instance to be used by the notification service
app.set('io', io);
notificationService.initialize(io);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start simulation if enabled
if (process.env.SIMULATION_MODE === 'true') {
  simulationService.startSimulation();
}

module.exports = { app, server };
