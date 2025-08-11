const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

async function checkAdminUser() {
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
      'SELECT id, username, email, firstName, lastName, role FROM users WHERE username = ? OR email = ?',
      ['SuperAdmin', 'anderson@rdesk.io']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user found:');
      console.log(existingUsers[0]);
    } else {
      console.log('Admin user does not exist');
    }
  } catch (error) {
    console.error('Error checking admin user:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
checkAdminUser();
