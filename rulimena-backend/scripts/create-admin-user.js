const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

async function createAdminUser() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rulimena',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database successfully');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['SuperAdmin', 'anderson@rdesk.io']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('rdesk0505', saltRounds);

    // Create the admin user
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, firstName, lastName, role, phoneNumber, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'SuperAdmin',
        'anderson@rdesk.io',
        hashedPassword,
        'Anderson',
        'Soplanit',
        'admin',
        '628123351700',
        true
      ]
    );

    console.log('Admin user created successfully with ID:', result.insertId);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
createAdminUser();