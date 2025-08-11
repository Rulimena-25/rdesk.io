const db = require('./database');

async function migrate() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        role ENUM('admin', 'supervisor', 'agent') DEFAULT 'agent',
        isActive BOOLEAN DEFAULT TRUE,
        phoneNumber VARCHAR(20),
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    
    console.log('Users table created successfully');

    // Create contacts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255),
        company VARCHAR(255),
        email VARCHAR(255),
        phoneNumbers JSON,
        address JSON,
        demographics JSON,
        score INT DEFAULT 0,
        status ENUM('new', 'contacted', 'interested', 'not-interested', 'do-not-call') DEFAULT 'new',
        assignedAgent INT,
        createdBy INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_score (score),
        INDEX idx_status (status),
        INDEX idx_createdBy (createdBy),
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assignedAgent) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Contacts table created successfully');

    // Create campaigns table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('draft', 'scheduled', 'active', 'paused', 'completed') DEFAULT 'draft',
        startDate DATETIME,
        endDate DATETIME,
        contacts JSON,
        productInfo JSON,
        createdBy INT NOT NULL,
        dialingStrategy ENUM('manual', 'turbo', 'predictive') DEFAULT 'manual',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_createdBy (createdBy),
        INDEX idx_startDate (startDate),
        INDEX idx_endDate (endDate),
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Campaigns table created successfully');

    // Create calls table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS calls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        contactId INT NOT NULL,
        agentId INT,
        phoneNumber VARCHAR(20),
        status ENUM('initiated', 'ringing', 'connected', 'completed', 'failed', 'busy', 'no-answer') DEFAULT 'initiated',
        direction ENUM('outbound', 'inbound') DEFAULT 'outbound',
        startTime DATETIME,
        endTime DATETIME,
        duration INT,
        recordingUrl VARCHAR(500),
        voicemail BOOLEAN DEFAULT FALSE,
        disposition VARCHAR(100),
        notes TEXT,
        customFields JSON,
        predictiveScore INT,
        systemData JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_campaignId (campaignId),
        INDEX idx_contactId (contactId),
        INDEX idx_agentId (agentId),
        INDEX idx_status (status),
        INDEX idx_startTime (startTime),
        FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Calls table created successfully');

    // Create call_logs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS call_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        callId INT NOT NULL,
        eventType VARCHAR(50) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        agentId INT,
        details JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_callId (callId),
        INDEX idx_eventType (eventType),
        INDEX idx_agentId (agentId),
        FOREIGN KEY (callId) REFERENCES calls(id) ON DELETE CASCADE,
        FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Call logs table created successfully');

    // Create predictive_models table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS predictive_models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50),
        algorithm VARCHAR(100),
        accuracy DECIMAL(5,2),
        features JSON,
        isActive BOOLEAN DEFAULT FALSE,
        trainingData JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_isActive (isActive),
        INDEX idx_createdAt (createdAt)
      )
    `);
    
    console.log('Predictive models table created successfully');

    // Create dispositions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dispositions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('positive', 'negative', 'neutral', 'system') DEFAULT 'neutral',
        description TEXT,
        followUpRequired BOOLEAN DEFAULT FALSE,
        followUpDelay INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdBy INT,
        INDEX idx_category (category),
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Dispositions table created successfully');

    // Create system_settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        settingKey VARCHAR(255) NOT NULL UNIQUE,
        settingValue JSON,
        description TEXT,
        category VARCHAR(100),
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updatedBy INT,
        INDEX idx_settingKey (settingKey),
        INDEX idx_category (category),
        FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('System settings table created successfully');

   // Create sip_config table for storing SIP account configurations
   await db.execute(`
     CREATE TABLE IF NOT EXISTS sip_config (
       id INT AUTO_INCREMENT PRIMARY KEY,
       userId INT NOT NULL,
       sipUsername VARCHAR(100) NOT NULL,
       sipPassword VARCHAR(100) NOT NULL,
       sipServer VARCHAR(100) NOT NULL,
       sipPort INT DEFAULT 5060,
       isActive BOOLEAN DEFAULT TRUE,
       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
       updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       INDEX idx_userId (userId),
       INDEX idx_sipUsername (sipUsername),
       FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
     )
   `);
   
   console.log('SIP config table created successfully');

   // Create sip_servers table for storing SIP server configurations
   await db.execute(`
     CREATE TABLE IF NOT EXISTS sip_servers (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       host VARCHAR(100) NOT NULL,
       port INT DEFAULT 5060,
       transport ENUM('udp', 'tcp', 'tls') DEFAULT 'udp',
       username VARCHAR(100),
       password VARCHAR(100),
       isActive BOOLEAN DEFAULT TRUE,
       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
       updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       INDEX idx_name (name),
       INDEX idx_host (host)
     )
   `);
   
   console.log('SIP servers table created successfully');

   console.log('Database migration completed successfully!');
   process.exit(0);
 } catch (error) {
   console.error('Database migration failed:', error);
   process.exit(1);
 }
}

migrate();