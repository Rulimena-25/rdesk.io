const db = require('../config/database');

class Campaign {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status || 'draft';
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.contacts = data.contacts ? JSON.parse(data.contacts) : [];
    this.productInfo = data.productInfo ? JSON.parse(data.productInfo) : {};
    this.createdBy = data.createdBy;
    this.dialingStrategy = data.dialingStrategy || 'manual';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new campaign
  static async create(campaignData) {
    const query = `
      INSERT INTO campaigns (name, description, status, startDate, endDate, contacts, 
                           productInfo, createdBy, dialingStrategy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      campaignData.name,
      campaignData.description,
      campaignData.status || 'draft',
      campaignData.startDate,
      campaignData.endDate,
      campaignData.contacts ? JSON.stringify(campaignData.contacts) : null,
      campaignData.productInfo ? JSON.stringify(campaignData.productInfo) : null,
      campaignData.createdBy,
      campaignData.dialingStrategy || 'manual'
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...campaignData };
    } catch (error) {
      throw error;
    }
  }

  // Find campaign by ID
  static async findById(id) {
    const query = 'SELECT * FROM campaigns WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Campaign(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find campaigns by creator
  static async findByCreator(createdBy) {
    const query = 'SELECT * FROM campaigns WHERE createdBy = ?';
    try {
      const [rows] = await db.execute(query, [createdBy]);
      return rows.map(row => new Campaign(row));
    } catch (error) {
      throw error;
    }
  }

  // Find campaigns by status
  static async findByStatus(status) {
    const query = 'SELECT * FROM campaigns WHERE status = ?';
    try {
      const [rows] = await db.execute(query, [status]);
      return rows.map(row => new Campaign(row));
    } catch (error) {
      throw error;
    }
  }

  // Update campaign
  async save() {
    const query = `
      UPDATE campaigns 
      SET name = ?, description = ?, status = ?, startDate = ?, endDate = ?, 
          contacts = ?, productInfo = ?, createdBy = ?, dialingStrategy = ?, 
          updatedAt = NOW()
      WHERE id = ?
    `;
    
    const values = [
      this.name,
      this.description,
      this.status,
      this.startDate,
      this.endDate,
      this.contacts ? JSON.stringify(this.contacts) : null,
      this.productInfo ? JSON.stringify(this.productInfo) : null,
      this.createdBy,
      this.dialingStrategy,
      this.id
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete campaign
  static async deleteById(id) {
    const query = 'DELETE FROM campaigns WHERE id = ?';
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all campaigns with pagination
  static async findAll(limit = 10, offset = 0) {
    const query = 'SELECT * FROM campaigns LIMIT ? OFFSET ?';
    try {
      const [rows] = await db.execute(query, [limit, offset]);
      return rows.map(row => new Campaign(row));
    } catch (error) {
      throw error;
    }
  }

  // Add contact to campaign
  static async addContact(campaignId, contactId) {
    const query = 'UPDATE campaigns SET contacts = JSON_ARRAY_APPEND(contacts, "$", ?) WHERE id = ?';
    try {
      const [result] = await db.execute(query, [contactId, campaignId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Remove contact from campaign
  static async removeContact(campaignId, contactId) {
    const query = 'UPDATE campaigns SET contacts = JSON_REMOVE(contacts, JSON_UNQUOTE(JSON_SEARCH(contacts, "one", ?))) WHERE id = ?';
    try {
      const [result] = await db.execute(query, [contactId, campaignId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Campaign;