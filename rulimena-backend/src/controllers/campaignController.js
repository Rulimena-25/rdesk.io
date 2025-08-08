const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const User = require('../models/User');
const Joi = require('joi');

// Get all campaigns with filtering and pagination
const getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For MySQL, we'll need to implement filtering differently
    // Get campaigns with pagination
    const campaigns = await Campaign.findAll(limit, skip);
    
    // Get total count (simplified for now)
    const totalCampaigns = campaigns.length;
    const totalPages = Math.ceil(totalCampaigns / limit);

    res.status(200).json({
      success: true,
      data: {
        campaigns,
        pagination: {
          currentPage: page,
          totalPages,
          totalCampaigns,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    // Validate request body
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      dialingStrategy: Joi.string().valid('manual', 'turbo', 'predictive').default('manual'),
      productInfo: Joi.object({
        productId: Joi.string().optional(),
        productName: Joi.string().optional(),
        productDescription: Joi.string().optional()
      }).optional(),
      createdBy: Joi.number().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    // Convert objects to JSON strings for MySQL
    if (value.productInfo) {
      value.productInfo = JSON.stringify(value.productInfo);
    }

    // Create campaign
    const campaign = await Campaign.create(value);

    // Convert back to objects for response
    if (campaign.productInfo) {
      campaign.productInfo = JSON.parse(campaign.productInfo);
    }

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific campaign
const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Convert JSON strings back to objects
    if (campaign.productInfo) {
      campaign.productInfo = JSON.parse(campaign.productInfo);
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a campaign
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update campaign fields
    Object.assign(campaign, req.body);
    
    // Convert objects to JSON strings for MySQL
    if (campaign.productInfo && typeof campaign.productInfo !== 'string') {
      campaign.productInfo = JSON.stringify(campaign.productInfo);
    }

    const result = await campaign.save();
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update campaign'
      });
    }

    // Convert back to objects for response
    if (campaign.productInfo) {
      campaign.productInfo = JSON.parse(campaign.productInfo);
    }

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a campaign
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const result = await Campaign.deleteById(req.params.id);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete campaign'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Start a campaign
const startCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update campaign status to active
    campaign.status = 'active';
    campaign.startDate = new Date();
    
    const result = await campaign.save();
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start campaign'
      });
    }

    // Auto-assign contacts to agents based on AgentName in demographics
    await autoAssignContactsToAgents(campaign.id);

    // Auto-trigger product information based on ProductID
    await autoTriggerProductInfo(campaign.id);

    // Emit campaign started event via WebSocket
    const { emitCampaignStarted } = require('../services/websocketService');
    emitCampaignStarted({
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      productInfo: campaign.productInfo ? JSON.parse(campaign.productInfo) : {}
    });

    // Convert back to objects for response
    if (campaign.productInfo) {
      campaign.productInfo = JSON.parse(campaign.productInfo);
    }

    res.status(200).json({
      success: true,
      message: 'Campaign started successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Stop a campaign
const stopCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update campaign status to paused or completed
    campaign.status = campaign.endDate && campaign.endDate < new Date() ? 'completed' : 'paused';
    
    const result = await campaign.save();
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to stop campaign'
      });
    }

    // Emit campaign stopped event via WebSocket
    const { emitCampaignStopped } = require('../services/websocketService');
    emitCampaignStopped({
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status
    });

    res.status(200).json({
      success: true,
      message: 'Campaign stopped successfully',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Auto-assign contacts to agents based on AgentName in demographics
const autoAssignContactsToAgents = async (campaignId) => {
  try {
    // Find contacts that don't have an assigned agent but have AgentName in demographics
    // For MySQL, we'll need to implement this differently
    console.log(`Auto-assigning contacts to agents for campaign ${campaignId}`);
  } catch (error) {
    console.error('Error auto-assigning contacts to agents:', error);
  }
};

// Auto-trigger product information based on ProductID
const autoTriggerProductInfo = async (campaignId) => {
  try {
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (campaign && campaign.productInfo) {
      const productInfo = JSON.parse(campaign.productInfo);
      if (productInfo.productId) {
        // In a real application, you would fetch product details from a product database
        // For now, we'll just log that product info should be triggered
        console.log(`Auto-triggering product info for ProductID: ${productInfo.productId}`);
        
        console.log(`Product info triggered for campaign ${campaignId}`);
      }
    }
  } catch (error) {
    console.error('Error auto-triggering product info:', error);
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  startCampaign,
  stopCampaign
};