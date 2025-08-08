#!/usr/bin/env node

/**
 * Simple test script to verify rulimena.io backend and frontend
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, () => {
      server.close();
      resolve(false);
    });
    server.on('error', () => {
      resolve(true);
    });
  });
}

// Function to start backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend server...');
    
    // Check if backend directory exists
    if (!fs.existsSync('./rulimena-backend')) {
      reject(new Error('rulimena-backend directory not found'));
      return;
    }
    
    // Change to backend directory
    process.chdir('./rulimena-backend');
    
    // Check if node_modules exists, if not install dependencies
    if (!fs.existsSync('./node_modules')) {
      console.log('Installing backend dependencies...');
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('Backend dependencies installed successfully');
          // Start the server
          const backend = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
          resolve(backend);
        } else {
          reject(new Error('Failed to install backend dependencies'));
        }
      });
    } else {
      // Start the server
      const backend = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
      resolve(backend);
    }
  });
}

// Function to start frontend
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('Starting frontend server...');
    
    // Change to frontend directory
    process.chdir('../rulimena-frontend');
    
    // Check if node_modules exists, if not install dependencies
    if (!fs.existsSync('./node_modules')) {
      console.log('Installing frontend dependencies...');
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('Frontend dependencies installed successfully');
          // Start the server
          const frontend = spawn('npm', ['start'], { stdio: 'inherit' });
          resolve(frontend);
        } else {
          reject(new Error('Failed to install frontend dependencies'));
        }
      });
    } else {
      // Start the server
      const frontend = spawn('npm', ['start'], { stdio: 'inherit' });
      resolve(frontend);
    }
  });
}

// Function to create sample data
function createSampleData() {
  const sampleData = [
    ['CustomerID', 'CustomerName', 'AgentID', 'ProductID', 'Phone', 'Email'],
    ['1', 'John Doe', 'Agent001', 'Product001', '628123456789', 'john@example.com'],
    ['2', 'Jane Smith', 'Agent002', 'Product002', '081298765432', 'jane@example.com'],
    ['3', 'Robert Johnson', 'Agent003', 'Product003', '628135551234', 'robert@example.com']
  ];
  
  const csvContent = sampleData.map(row => row.join(',')).join('\n');
  
  fs.writeFileSync('../sample_contacts.csv', csvContent);
  console.log('Sample data created: sample_contacts.csv');
}

// Main function
async function main() {
  try {
    console.log('=== rulimena.io System Test ===\n');
    
    // Create sample data
    createSampleData();
    
    // Check if required directories exist
    if (!fs.existsSync('./rulimena-backend') || !fs.existsSync('./rulimena-frontend')) {
      console.error('Error: Required directories not found.');
      console.log('Please ensure you have rulimena-backend and rulimena-frontend directories.');
      process.exit(1);
    }
    
    // Check if MongoDB and Redis are running (simple check)
    console.log('Please ensure MongoDB and Redis are running before proceeding.');
    console.log('You can start them with:');
    console.log('  MongoDB: mongod');
    console.log('  Redis: redis-server\n');
    
    console.log('Starting backend server...');
    const backendProcess = await startBackend();
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\nStarting frontend server...');
    const frontendProcess = await startFrontend();
    
    console.log('\n=== System Started Successfully ===');
    console.log('Backend: http://localhost:3000');
    console.log('Frontend: http://localhost:3001');
    console.log('Sample data file: sample_contacts.csv');
    console.log('\nTo stop the servers, press Ctrl+C');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\nShutting down servers...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error starting system:', error.message);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { startBackend, startFrontend, createSampleData };