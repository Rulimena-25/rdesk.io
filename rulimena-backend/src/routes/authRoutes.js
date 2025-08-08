const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user info (protected route)
router.get('/me', authenticate, getCurrentUser);

module.exports = router;