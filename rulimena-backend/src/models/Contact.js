const db = require('../config/database');

class Contact {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.company = data.company;
    this.email = data.email;
    this.phoneNumbers = data.phoneNumbers ? JSON.parse(data.phoneNumbers) : [];
    this.address = data.address ? JSON.parse(data.address) : {};
    this.demographics = data.demographics ? JSON.parse(data.demographics) : {};
    this.score = data.score || 0;
    this.status = data.status || 'new';
    this.assignedAgent = data.assignedAgent;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new contact
  static async create(contactData) {
    const query = `
      INSERT INTO contacts (firstName, lastName, company, email, phoneNumbers, address, 
                           demographics, score, status, assignedAgent, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      contactData.firstName,
      contactData.lastName,
      contactData.company,
      contactData.email,
      contactData.phoneNumbers ? JSON.stringify(contactData.phoneNumbers) : null,
      contactData.address ? JSON.stringify(contactData.address) : null,
      contactData.demographics ? JSON.stringify(contactData.demographics) : null,
      contactData.score || 0,
      contactData.status || 'new',
      contactData.assignedAgent,
      contactData.createdBy
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...contactData };
    } catch (error) {
      throw error;
    }
  }

  // Find contact by ID
  static async findById(id) {
    const query = 'SELECT * FROM contacts WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Contact(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find contacts by creator
  static async findByCreator(createdBy) {
    const query = 'SELECT * FROM contacts WHERE createdBy = ?';
    try {
      const [rows] = await db.execute(query, [createdBy]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw error;
    }
  }

  // Find contacts by status
  static async findByStatus(status) {
    const query = 'SELECT * FROM contacts WHERE status = ?';
    try {
      const [rows] = await db.execute(query, [status]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw error;
    }
  }

  // Find contacts by agent
  static async findByAgent(agentId) {
    const query = 'SELECT * FROM contacts WHERE assignedAgent = ?';
    try {
      const [rows] = await db.execute(query, [agentId]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw error;
    }
  }

  // Update contact
  async save() {
    const query = `
      UPDATE contacts 
      SET firstName = ?, lastName = ?, company = ?, email = ?, phoneNumbers = ?, 
          address = ?, demographics = ?, score = ?, status = ?, assignedAgent = ?, 
          createdBy = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    
    const values = [
      this.firstName,
      this.lastName,
      this.company,
      this.email,
      this.phoneNumbers ? JSON.stringify(this.phoneNumbers) : null,
      this.address ? JSON.stringify(this.address) : null,
      this.demographics ? JSON.stringify(this.demographics) : null,
      this.score,
      this.status,
      this.assignedAgent,
      this.createdBy,
      this.id
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete contact
  static async deleteById(id) {
    const query = 'DELETE FROM contacts WHERE id = ?';
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all contacts with pagination
  static async findAll(limit = 10, offset = 0) {
    const query = 'SELECT * FROM contacts LIMIT ? OFFSET ?';
    try {
      const [rows] = await db.execute(query, [limit, offset]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw error;
    }
  }

  // Search contacts by name or email
  static async search(searchTerm) {
    const query = 'SELECT * FROM contacts WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?';
    try {
      const [rows] = await db.execute(query, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      return rows.map(row => new Contact(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contact;