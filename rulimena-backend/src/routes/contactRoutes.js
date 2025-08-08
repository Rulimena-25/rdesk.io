const express = require('express');
const { 
  getContacts, 
  createContact, 
  getContact, 
  updateContact, 
  deleteContact,
  uploadContacts,
  upload
} = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAgent } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all contacts with filtering and pagination
router.get('/', requireAgent, getContacts);

// Upload contacts from flexible format files
router.post('/upload', requireAgent, upload, uploadContacts);

// Create a new contact
router.post('/', requireAgent, createContact);

// Get a specific contact
router.get('/:id', requireAgent, getContact);

// Update a contact
router.put('/:id', requireAgent, updateContact);

// Delete a contact
router.delete('/:id', requireAgent, deleteContact);

module.exports = router;