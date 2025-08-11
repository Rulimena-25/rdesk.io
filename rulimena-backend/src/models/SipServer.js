const db = require('../config/database');

class SipServer {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.host = data.host;
    this.port = data.port || 5060;
    this.transport = data.transport || 'udp';
    this.username = data.username;
    this.password = data.password;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new SIP server configuration
  static async create(serverData) {
    const query = `
      INSERT INTO sip_servers (name, host, port, transport, username, password, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      serverData.name,
      serverData.host,
      serverData.port || 5060,
      serverData.transport || 'udp',
      serverData.username,
      serverData.password,
      serverData.isActive !== undefined ? serverData.isActive : true
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...serverData };
    } catch (error) {
      throw error;
    }
  }

  // Find SIP server by ID
  static async findById(id) {
    const query = 'SELECT * FROM sip_servers WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new SipServer(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find SIP server by name
  static async findByName(name) {
    const query = 'SELECT * FROM sip_servers WHERE name = ?';
    try {
      const [rows] = await db.execute(query, [name]);
      return rows.length > 0 ? new SipServer(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find SIP server by host
  static async findByHost(host) {
    const query = 'SELECT * FROM sip_servers WHERE host = ? AND isActive = TRUE';
    try {
      const [rows] = await db.execute(query, [host]);
      return rows.length > 0 ? new SipServer(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update SIP server configuration
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
    const query = `UPDATE sip_servers SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete SIP server configuration
  static async deleteById(id) {
    const query = 'DELETE FROM sip_servers WHERE id = ?';
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all active SIP servers
  static async findActive() {
    const query = 'SELECT * FROM sip_servers WHERE isActive = TRUE';
    try {
      const [rows] = await db.execute(query);
      return rows.map(row => new SipServer(row));
    } catch (error) {
      throw error;
    }
  }

  // Get all SIP servers
  static async findAll() {
    const query = 'SELECT * FROM sip_servers ORDER BY name';
    try {
      const [rows] = await db.execute(query);
      return rows.map(row => new SipServer(row));
    } catch (error) {
      throw error;
    }
  }

  // Deactivate SIP server
  static async deactivate(id) {
    return await this.update(id, { isActive: false });
  }

  // Activate SIP server
  static async activate(id) {
    return await this.update(id, { isActive: true });
  }
}

module.exports = SipServer;