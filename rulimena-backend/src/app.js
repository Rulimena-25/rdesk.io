const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

// Initialize database
require('./config/database');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'rulimena-backend API', 
    version: '1.0.0' 
  });
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Contact routes
app.use('/api/contacts', require('./routes/contactRoutes'));

// Campaign routes
app.use('/api/campaigns', require('./routes/campaignRoutes'));
 
// Initialize SIP service
const sipService = require('./services/sipService');
sipService.initialize().catch(error => {
  console.error('Failed to initialize SIP service:', error);
});

// Initialize WebSocket
const { initializeWebSocket } = require('./utils/websocket');
const { io } = initializeWebSocket(server);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, io };