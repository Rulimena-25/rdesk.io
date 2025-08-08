const db = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || 'agent';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.phoneNumber = data.phoneNumber;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Create a new user
  static async create(userData) {
    const query = `
      INSERT INTO users (username, email, password, firstName, lastName, role, isActive, phoneNumber, lastLogin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userData.username,
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.role || 'agent',
      userData.isActive !== undefined ? userData.isActive : true,
      userData.phoneNumber,
      userData.lastLogin || null
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return { id: result.insertId, ...userData };
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    try {
      const [rows] = await db.execute(query, [username]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
      const [rows] = await db.execute(query, [email]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username or email
  static async findByUsernameOrEmail(username, email) {
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    try {
      const [rows] = await db.execute(query, [username, email]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update last login time
  static async updateLastLogin(userId) {
    const query = 'UPDATE users SET lastLogin = NOW(), updatedAt = NOW() WHERE id = ?';
    try {
      const [result] = await db.execute(query, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Save user (update)
  async save() {
    const query = `
      UPDATE users 
      SET username = ?, email = ?, password = ?, firstName = ?, lastName = ?, 
          role = ?, isActive = ?, phoneNumber = ?, lastLogin = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    
    const values = [
      this.username,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      this.isActive,
      this.phoneNumber,
      this.lastLogin,
      this.id
    ];
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;