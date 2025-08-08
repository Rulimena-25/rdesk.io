const express = require('express');
const { 
  getCampaigns, 
  createCampaign, 
  getCampaign, 
  updateCampaign, 
  deleteCampaign,
  startCampaign,
  stopCampaign
} = require('../controllers/campaignController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireSupervisorOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all campaigns with filtering and pagination
router.get('/', requireSupervisorOrAdmin, getCampaigns);

// Create a new campaign
router.post('/', requireSupervisorOrAdmin, createCampaign);

// Get a specific campaign
router.get('/:id', requireSupervisorOrAdmin, getCampaign);

// Update a campaign
router.put('/:id', requireSupervisorOrAdmin, updateCampaign);

// Delete a campaign
router.delete('/:id', requireSupervisorOrAdmin, deleteCampaign);

// Start a campaign
router.post('/:id/start', requireSupervisorOrAdmin, startCampaign);

// Stop a campaign
router.post('/:id/stop', requireSupervisorOrAdmin, stopCampaign);

module.exports = router;