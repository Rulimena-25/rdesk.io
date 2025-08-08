# rulimena.io VPS Deployment Guide

This guide provides step-by-step instructions for deploying the rulimena.io predictive dialer system to a Virtual Private Server (VPS). This deployment approach is suitable for small to medium-sized call centers and provides a production-ready setup with proper security, performance, and reliability considerations.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Database Setup](#database-setup)
   - [MongoDB Installation](#mongodb-installation)
   - [Redis Installation](#redis-installation)
4. [Application Deployment](#application-deployment)
   - [Backend Deployment](#backend-deployment)
   - [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Process Management](#process-management)
7. [Reverse Proxy Setup](#reverse-proxy-setup)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup Strategy](#backup-strategy)
11. [Security Considerations](#security-considerations)

## System Requirements

For a production deployment of rulimena.io, we recommend the following minimum VPS specifications:

- **CPU**: 4 cores (2.0 GHz or higher)
- **RAM**: 8 GB
- **Storage**: 50 GB SSD (minimum)
- **Operating System**: Ubuntu 20.04 LTS or newer
- **Bandwidth**: 100 Mbps network connection

For larger deployments with more concurrent users or higher call volumes, consider scaling up the resources accordingly.

## Initial Server Setup

1. **Update the system packages**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install essential packages**:
   ```bash
   sudo apt install -y curl wget git unzip build-essential software-properties-common
   ```

3. **Create a dedicated user for the application**:
   ```bash
   sudo adduser rulimena
   sudo usermod -aG sudo rulimena
   ```

4. **Switch to the new user**:
   ```bash
   su - rulimena
   ```

5. **Install Node.js** (version 16 or higher):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

6. **Verify Node.js installation**:
   ```bash
   node --version
   npm --version
   ```

## Database Setup

### MongoDB Installation

1. **Import the MongoDB public GPG key**:
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Create a list file for MongoDB**:
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Update the package database**:
   ```bash
   sudo apt update
   ```

4. **Install MongoDB**:
   ```bash
   sudo apt install -y mongodb-org
   ```

5. **Start and enable MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

6. **Secure MongoDB**:
   ```bash
   # Create admin user
   mongo
   use admin
   db.createUser({user: "admin", pwd: "your_secure_password", roles: [{role: "userAdminAnyDatabase", db: "admin"}]})
   exit
   
   # Enable authentication in MongoDB config
   sudo nano /etc/mongod.conf
   ```
   
   Add the following lines to the config file:
   ```yaml
   security:
     authorization: enabled
   ```
   
   Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```

7. **Create database and user for rulimena**:
   ```bash
   mongo -u admin -p your_secure_password --authenticationDatabase admin
   use rulimena
   db.createUser({user: "rulimena_user", pwd: "your_database_password", roles: [{role: "readWrite", db: "rulimena"}]})
   exit
   ```

### Redis Installation

1. **Install Redis**:
   ```bash
   sudo apt install -y redis-server
   ```

2. **Configure Redis for security**:
   ```bash
   sudo nano /etc/redis/redis.conf
   ```
   
   Make the following changes:
   ```
   # Set a password
   requirepass your_redis_password
   
   # Bind to localhost only
   bind 127.0.0.1
   ```

3. **Restart Redis**:
   ```bash
   sudo systemctl restart redis-server
   sudo systemctl enable redis-server
   ```

## Application Deployment

### Backend Deployment

1. **Clone the repository** (or upload your code):
   ```bash
   git clone <your-repository-url> rulimena-backend
   cd rulimena-backend
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Create environment configuration**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update the configuration values:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   
   # Database Configuration
   MONGODB_URI=mongodb://rulimena_user:your_database_password@localhost:27017/rulimena
   MONGODB_USER=rulimena_user
   MONGODB_PASSWORD=your_database_password
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   
   # JWT Configuration
   JWT_SECRET=your_very_secure_jwt_secret
   JWT_EXPIRES_IN=24h
   
   # Application Configuration
   APP_NAME=rulimena-backend
   ```

4. **Test the backend**:
   ```bash
   npm start
   ```
   
   If everything works correctly, stop the server with `Ctrl+C`.

### Frontend Deployment

1. **Navigate to the frontend directory**:
   ```bash
   cd ../rulimena-frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Create environment configuration**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update the configuration values:
   ```env
   # API Configuration
   REACT_APP_API_URL=https://your-domain.com/api
   REACT_APP_WS_URL=wss://your-domain.com
   
   # Application Settings
   REACT_APP_NAME=rulimena.io
   REACT_APP_DESCRIPTION=Smart Predictive Dialer System
   ```

4. **Build the frontend for production**:
   ```bash
   npm run build
   ```

## Environment Configuration

After deploying both the frontend and backend, ensure all environment variables are properly configured:

### Backend Environment Variables (.env)

- `PORT`: The port on which the backend server will run (default: 3000)
- `NODE_ENV`: Set to "production" for production deployments
- `MONGODB_URI`: Connection string for MongoDB with authentication
- `REDIS_HOST`: Redis server hostname (usually localhost)
- `REDIS_PORT`: Redis server port (usually 6379)
- `REDIS_PASSWORD`: Password for Redis authentication
- `JWT_SECRET`: A strong, random secret for JWT token signing
- `JWT_EXPIRES_IN`: Token expiration time (e.g., "24h")

### Frontend Environment Variables (.env)

- `REACT_APP_API_URL`: The URL of your backend API (e.g., "https://your-domain.com/api")
- `REACT_APP_WS_URL`: The WebSocket URL (e.g., "wss://your-domain.com")

## Process Management

For production deployments, it's recommended to use PM2 to manage your Node.js processes.

1. **Install PM2 globally**:
   ```bash
   sudo npm install -g pm2
   ```

2. **Create an ecosystem file for the backend**:
   ```bash
   nano ecosystem.config.js
   ```
   
   Add the following content:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'rulimena-backend',
         script: './src/app.js',
         instances: 2,
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
         },
         cwd: './rulimena-backend'
       }
     ]
   };
   ```

3. **Start the backend with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Set PM2 to start on boot**:
   ```bash
   pm2 startup
   pm2 save
   ```

## Reverse Proxy Setup

To serve both the frontend and backend through a single domain, we'll use Nginx as a reverse proxy.

1. **Install Nginx**:
   ```bash
   sudo apt install -y nginx
   ```

2. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/rulimena
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       # Frontend static files
       location / {
           root /home/rulimena/rulimena-frontend/build;
           try_files $uri $uri/ /index.html;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   
       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   
       # WebSocket support
       location /socket.io/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/rulimena /etc/nginx/sites-enabled/
   ```

4. **Test Nginx configuration**:
   ```bash
   sudo nginx -t
   ```

5. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

## SSL Certificate Setup

To secure your deployment with HTTPS, we'll use Let's Encrypt with Certbot.

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain and install SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Test automatic renewal**:
   ```bash
   sudo certbot renew --dry-run
   ```

## Monitoring and Logging

### Backend Logging

The application logs to the console by default. With PM2, you can view logs with:

```bash
pm2 logs rulimena-backend
```

### System Monitoring

Install htop for system monitoring:
```bash
sudo apt install -y htop
```

### Log Rotation

To prevent logs from consuming too much disk space, set up log rotation:

1. **Create a logrotate configuration**:
   ```bash
   sudo nano /etc/logrotate.d/rulimena
   ```
   
   Add the following content:
   ```
   /home/rulimena/.pm2/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 0644 rulimena rulimena
       postrotate
           pm2 reloadLogs
       endscript
   }
   ```

## Backup Strategy

### MongoDB Backup

1. **Create a backup script**:
   ```bash
   nano ~/backup_mongodb.sh
   ```
   
   Add the following content:
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/home/rulimena/backups"
   MONGO_DATABASE="rulimena"
   
   mkdir -p $BACKUP_DIR
   
   mongodump --host localhost --port 27017 --db $MONGO_DATABASE --username rulimena_user --password your_database_password --out $BACKUP_DIR/mongodb_$DATE
   
   # Compress the backup
   tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE
   
   # Remove uncompressed backup
   rm -rf $BACKUP_DIR/mongodb_$DATE
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete
   ```

2. **Make the script executable**:
   ```bash
   chmod +x ~/backup_mongodb.sh
   ```

3. **Set up a cron job for daily backups**:
   ```bash
   crontab -e
   ```
   
   Add the following line for daily backups at 2 AM:
   ```
   0 2 * * * /home/rulimena/backup_mongodb.sh
   ```

### Application Code Backup

Regularly backup your application code and configuration files:
```bash
tar -czf /home/rulimena/backups/app_backup_$(date +%Y%m%d).tar.gz /home/rulimena/rulimena-backend /home/rulimena/rulimena-frontend
```

## Security Considerations

1. **Firewall Setup**:
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

2. **SSH Security**:
   - Disable password authentication
   - Use SSH keys only
   - Change the default SSH port

3. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Fail2Ban** (optional but recommended):
   ```bash
   sudo apt install -y fail2ban
   ```

5. **Application-Level Security**:
   - Use strong passwords for all services
   - Regularly rotate JWT secrets
   - Implement proper rate limiting
   - Keep dependencies up to date

## Conclusion

After completing all these steps, your rulimena.io system should be successfully deployed to your VPS with:

- Secure database connections
- HTTPS encryption
- Process management with PM2
- Reverse proxy with Nginx
- Automated backups
- Monitoring and logging
- Proper security configurations

For high-availability deployments or larger scale requirements, consider the more comprehensive cloud deployment approach described in `cloud_deployment.md`.