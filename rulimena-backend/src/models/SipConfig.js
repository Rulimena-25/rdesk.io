const db = require('../config/database');

class SipConfig {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.sipUsername = data.sipUsername;
    this.sipPassword = data.sipPassword;
    this.sipServer = data.sipServer;
    this.sipPort = data.sipPort || 5060;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new SIP configuration
  static async create(configData) {
    const query = `
      INSERT INTO sip_config (userId, sipUsername, sipPassword, sipServer, sipPort, isActive)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      configData.userId,
      configData.sipUsername,
      configData.sipPassword,
      configData.sipServer,
      configData.sipPort || 5060,
      configData.isActive !== undefined ? configData.isActive : true
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...configData };
    } catch (error) {
      throw error;
    }
  }

  // Find SIP configuration by ID
  static async findById(id) {
    const query = 'SELECT * FROM sip_config WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new SipConfig(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find SIP configuration by user ID
  static async findByUserId(userId) {
    const query = 'SELECT * FROM sip_config WHERE userId = ? AND isActive = TRUE';
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows.length > 0 ? new SipConfig(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find SIP configuration by SIP username
  static async findBySipUsername(sipUsername) {
    const query = 'SELECT * FROM sip_config WHERE sipUsername = ? AND isActive = TRUE';
    try {
      const [rows] = await db.execute(query, [sipUsername]);
      return rows.length > 0 ? new SipConfig(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update SIP configuration
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    values.push(id);
    const query = `UPDATE sip_config SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete SIP configuration
  static async deleteById(id) {
    const query = 'DELETE FROM sip_config WHERE id = ?';
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all active SIP configurations
  static async findActive() {
    const query = 'SELECT * FROM sip_config WHERE isActive = TRUE';
    try {
      const [rows] = await db.execute(query);
      return rows.map(row => new SipConfig(row));
    } catch (error) {
      throw error;
    }
  }

  // Deactivate SIP configuration
  static async deactivate(id) {
    return await this.update(id, { isActive: false });
  }

  // Activate SIP configuration
  static async activate(id) {
    return await this.update(id, { isActive: true });
  }
}

module.exports = SipConfig;