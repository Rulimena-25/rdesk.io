const db = require('../config/database');

class CallLog {
  constructor(data) {
    this.id = data.id;
    this.callId = data.callId;
    this.eventType = data.eventType;
    this.agentId = data.agentId;
    this.details = data.details ? JSON.parse(data.details) : {};
    this.createdAt = data.createdAt;
  }

  // Create a new call log entry
  static async create(logData) {
    const query = `
      INSERT INTO call_logs (callId, eventType, agentId, details)
      VALUES (?, ?, ?, ?)
    `;
    
    const values = [
      logData.callId,
      logData.eventType,
      logData.agentId || null,
      logData.details ? JSON.stringify(logData.details) : null
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...logData };
    } catch (error) {
      throw error;
    }
  }

  // Find call logs by call ID
  static async findByCallId(callId) {
    const query = 'SELECT * FROM call_logs WHERE callId = ? ORDER BY createdAt ASC';
    try {
      const [rows] = await db.execute(query, [callId]);
      return rows.map(row => new CallLog({
        ...row,
        details: row.details ? JSON.parse(row.details) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Find call logs by agent ID
  static async findByAgentId(agentId, limit = 50) {
    const query = 'SELECT * FROM call_logs WHERE agentId = ? ORDER BY createdAt DESC LIMIT ?';
    try {
      const [rows] = await db.execute(query, [agentId, limit]);
      return rows.map(row => new CallLog({
        ...row,
        details: row.details ? JSON.parse(row.details) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Find call logs by event type
  static async findByEventType(eventType, limit = 50) {
    const query = 'SELECT * FROM call_logs WHERE eventType = ? ORDER BY createdAt DESC LIMIT ?';
    try {
      const [rows] = await db.execute(query, [eventType, limit]);
      return rows.map(row => new CallLog({
        ...row,
        details: row.details ? JSON.parse(row.details) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get recent call logs
  static async getRecent(limit = 100) {
    const query = 'SELECT * FROM call_logs ORDER BY createdAt DESC LIMIT ?';
    try {
      const [rows] = await db.execute(query, [limit]);
      return rows.map(row => new CallLog({
        ...row,
        details: row.details ? JSON.parse(row.details) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Delete call logs by call ID
  static async deleteByCallId(callId) {
    const query = 'DELETE FROM call_logs WHERE callId = ?';
    try {
      const [result] = await db.execute(query, [callId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CallLog;