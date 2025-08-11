const db = require('../config/database');

class Call {
  constructor(data) {
    this.id = data.id;
    this.campaignId = data.campaignId;
    this.contactId = data.contactId;
    this.agentId = data.agentId;
    this.phoneNumber = data.phoneNumber;
    this.status = data.status || 'initiated';
    this.direction = data.direction || 'outbound';
    this.duration = data.duration || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new call
  static async create(callData) {
    const query = `
      INSERT INTO calls (campaignId, contactId, agentId, phoneNumber, status, direction, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      callData.campaignId || null,
      callData.contactId || null,
      callData.agentId,
      callData.phoneNumber,
      callData.status || 'initiated',
      callData.direction || 'outbound',
      callData.duration || 0
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...callData };
    } catch (error) {
      throw error;
    }
  }

  // Find call by ID
  static async findById(id) {
    const query = 'SELECT * FROM calls WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Call(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find calls by agent
  static async findByAgent(agentId) {
    const query = 'SELECT * FROM calls WHERE agentId = ? ORDER BY createdAt DESC';
    try {
      const [rows] = await db.execute(query, [agentId]);
      return rows.map(row => new Call(row));
    } catch (error) {
      throw error;
    }
  }

  // Find calls by campaign
  static async findByCampaign(campaignId) {
    const query = 'SELECT * FROM calls WHERE campaignId = ? ORDER BY createdAt DESC';
    try {
      const [rows] = await db.execute(query, [campaignId]);
      return rows.map(row => new Call(row));
    } catch (error) {
      throw error;
    }
  }

  // Update call status
  static async updateStatus(id, status) {
    const query = 'UPDATE calls SET status = ?, updatedAt = NOW() WHERE id = ?';
    try {
      const [result] = await db.execute(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update call duration
  static async updateDuration(id, duration) {
    const query = 'UPDATE calls SET duration = ?, updatedAt = NOW() WHERE id = ?';
    try {
      const [result] = await db.execute(query, [duration, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update call
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
    const query = `UPDATE calls SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete call
  static async deleteById(id) {
    const query = 'DELETE FROM calls WHERE id = ?';
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all calls with pagination
  static async findAll(limit = 10, offset = 0) {
    const query = 'SELECT * FROM calls ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    try {
      const [rows] = await db.execute(query, [limit, offset]);
      return rows.map(row => new Call(row));
    } catch (error) {
      throw error;
    }
  }

  // Get call statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as totalCalls,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCalls,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedCalls,
        SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busyCalls,
        SUM(CASE WHEN status = 'no-answer' THEN 1 ELSE 0 END) as noAnswerCalls,
        AVG(duration) as averageDuration
      FROM calls
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Call;