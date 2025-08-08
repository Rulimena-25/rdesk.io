const Contact = require('../models/Contact');
const multer = require('multer');
const XLSX = require('xlsx');
const Joi = require('joi');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Get all contacts with filtering and pagination
const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For MySQL, we'll need to implement filtering differently
    // Get contacts with pagination
    const contacts = await Contact.findAll(limit, skip);
    
    // Get total count (simplified for now)
    const totalContacts = contacts.length;
    const totalPages = Math.ceil(totalContacts / limit);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalContacts,
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

// Create a new contact
const createContact = async (req, res) => {
  try {
    // Validate request body
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().optional(),
      company: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phoneNumbers: Joi.array().items(Joi.object({
        type: Joi.string().valid('mobile', 'home', 'work', 'other').default('mobile'),
        number: Joi.string().required(),
        primary: Joi.boolean().default(false)
      })).optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional()
      }).optional(),
      demographics: Joi.object({
        age: Joi.number().optional(),
        gender: Joi.string().optional(),
        income: Joi.number().optional(),
        occupation: Joi.string().optional(),
        agentName: Joi.string().optional(),
        productId: Joi.string().optional()
      }).optional(),
      score: Joi.number().default(0),
      status: Joi.string().valid('new', 'contacted', 'interested', 'not-interested', 'do-not-call').default('new'),
      assignedAgent: Joi.number().optional(),
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

    // Convert arrays and objects to JSON strings for MySQL
    if (value.phoneNumbers) {
      value.phoneNumbers = JSON.stringify(value.phoneNumbers);
    }
    if (value.address) {
      value.address = JSON.stringify(value.address);
    }
    if (value.demographics) {
      value.demographics = JSON.stringify(value.demographics);
    }

    // Create contact
    const contact = await Contact.create(value);

    // Convert back to objects for response
    if (contact.phoneNumbers) {
      contact.phoneNumbers = JSON.parse(contact.phoneNumbers);
    }
    if (contact.address) {
      contact.address = JSON.parse(contact.address);
    }
    if (contact.demographics) {
      contact.demographics = JSON.parse(contact.demographics);
    }

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific contact
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Convert JSON strings back to objects
    if (contact.phoneNumbers) {
      contact.phoneNumbers = JSON.parse(contact.phoneNumbers);
    }
    if (contact.address) {
      contact.address = JSON.parse(contact.address);
    }
    if (contact.demographics) {
      contact.demographics = JSON.parse(contact.demographics);
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a contact
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update contact fields
    Object.assign(contact, req.body);
    
    // Convert arrays and objects to JSON strings for MySQL
    if (contact.phoneNumbers && typeof contact.phoneNumbers !== 'string') {
      contact.phoneNumbers = JSON.stringify(contact.phoneNumbers);
    }
    if (contact.address && typeof contact.address !== 'string') {
      contact.address = JSON.stringify(contact.address);
    }
    if (contact.demographics && typeof contact.demographics !== 'string') {
      contact.demographics = JSON.stringify(contact.demographics);
    }

    const result = await contact.save();
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update contact'
      });
    }

    // Convert back to objects for response
    if (contact.phoneNumbers) {
      contact.phoneNumbers = JSON.parse(contact.phoneNumbers);
    }
    if (contact.address) {
      contact.address = JSON.parse(contact.address);
    }
    if (contact.demographics) {
      contact.demographics = JSON.parse(contact.demographics);
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const result = await Contact.deleteById(req.params.id);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete contact'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Normalize Indonesian phone number format
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove any non-digit characters except +
  let normalized = phone.toString().replace(/[^\d+]/g, '');
  
  // Handle Indonesian format
  if (normalized.startsWith('0')) {
    // Convert 0 to 62
    normalized = '62' + normalized.substring(1);
  } else if (normalized.startsWith('+62')) {
    // Already in correct format
    normalized = normalized;
  } else if (normalized.startsWith('62')) {
    // Already in correct format
    normalized = normalized;
  } else {
    // Assume it's a local number, add 62
    normalized = '62' + normalized;
  }
  
  return normalized;
};

// Auto-detect phone number columns
const detectPhoneColumns = (headers) => {
  const phoneKeywords = ['phone', 'tel', 'mobile', 'hp', 'wa', 'whatsapp'];
  return headers.filter(header => 
    phoneKeywords.some(keyword => 
      header.toLowerCase().includes(keyword)
    )
  );
};

// Parse and process flexible data format
const parseFlexibleData = (jsonData) => {
  try {
    const processedContacts = [];
    const errors = [];
    
    // Get all headers from the first row
    const headers = Object.keys(jsonData[0] || {});
    
    // Auto-detect phone number columns
    const phoneColumns = detectPhoneColumns(headers);
    
    for (const row of jsonData) {
      try {
        // Extract key fields
        const customerID = row.CustomerID || row.customerID || row['Customer ID'] || 
                           row.customer_id || row.id || row.ID || '';
        const customerName = row.CustomerName || row.customerName || row['Customer Name'] || 
                            row.customer_name || row.name || row.Name || '';
        const agentID = row.AgentID || row.agentID || row['Agent ID'] || 
                       row.agent_id || row.agent || row.Agent || '';
        const productID = row.ProductID || row.productID || row['Product ID'] || 
                         row.product_id || row.product || row.Product || '';
        
        // Extract phone numbers from detected columns
        const phoneNumbers = [];
        phoneColumns.forEach(col => {
          if (row[col]) {
            const normalizedPhone = normalizePhoneNumber(row[col]);
            if (normalizedPhone) {
              phoneNumbers.push({
                type: 'mobile',
                number: normalizedPhone,
                primary: phoneNumbers.length === 0 // First phone is primary
              });
            }
          }
        });
        
        // If no phone columns detected, try to find any field that looks like a phone number
        if (phoneNumbers.length === 0) {
          Object.entries(row).forEach(([key, value]) => {
            // Check if the value looks like a phone number
            if (typeof value === 'string' && 
                (value.includes('62') || value.includes('08') || value.includes('+62'))) {
              const normalizedPhone = normalizePhoneNumber(value);
              if (normalizedPhone) {
                phoneNumbers.push({
                  type: 'mobile',
                  number: normalizedPhone,
                  primary: phoneNumbers.length === 0
                });
              }
            }
          });
        }
        
        // Split customer name into first and last name
        let firstName = '';
        let lastName = '';
        if (customerName) {
          const nameParts = customerName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Create contact object
        const contact = {
          firstName: firstName || 'Unknown',
          lastName: lastName,
          company: row.Company || row.company || row.company_name || row.CompanyName || '',
          email: row.Email || row.email || '',
          phoneNumbers: phoneNumbers,
          demographics: {
            agentName: agentID,
            productId: productID
          },
          status: 'new'
        };
        
        processedContacts.push(contact);
      } catch (error) {
        errors.push({
          row: row,
          error: error.message
        });
      }
    }
    
    return { processedContacts, errors };
  } catch (error) {
    throw new Error(`Error processing data: ${error.message}`);
  }
};

// Upload contacts from flexible format files
const uploadContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Parse the file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Process the data with flexible format
    const { processedContacts, errors } = parseFlexibleData(jsonData);
    
    // Save contacts to database
    const createdContacts = [];
    const saveErrors = [];
    
    for (const contactData of processedContacts) {
      try {
        // Add createdBy field from authenticated user
        contactData.createdBy = req.user.userId;
        
        // Convert arrays and objects to JSON strings for MySQL
        if (contactData.phoneNumbers) {
          contactData.phoneNumbers = JSON.stringify(contactData.phoneNumbers);
        }
        if (contactData.demographics) {
          contactData.demographics = JSON.stringify(contactData.demographics);
        }
        
        // Create contact
        const contact = await Contact.create(contactData);
        createdContacts.push(contact);
      } catch (error) {
        saveErrors.push({
          contact: contactData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Contacts upload completed. ${createdContacts.length} contacts created, ${errors.length + saveErrors.length} errors.`,
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        contactsCreated: createdContacts.length,
        parsingErrors: errors,
        savingErrors: saveErrors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message
    });
  }
};

module.exports = {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  uploadContacts,
  upload: upload.single('file')
};