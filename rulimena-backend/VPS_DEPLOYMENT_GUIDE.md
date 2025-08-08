# VPS Deployment Guide for rulimena-backend

This guide provides step-by-step instructions for deploying the rulimena-backend application on your Ubuntu 22.04 VPS via SSH.

## Prerequisites

- Ubuntu 22.04 VPS
- SSH access to your VPS
- sudo privileges

## Step-by-Step Deployment

### 1. Connect to Your VPS via SSH

```bash
ssh username@your_vps_ip_address
```

Replace `username` with your VPS username and `your_vps_ip_address` with your VPS IP address.

### 2. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Required Dependencies

```bash
sudo apt install -y curl wget git unzip
```

### 4. Install Node.js

```bash
# Install NodeSource Node.js 18.x repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs
```

### 5. Install MySQL Server

```bash
# Install MySQL
sudo apt install -y mysql-server

# Start and enable MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 6. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set up the root password (recommended)
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### 7. Create Database and User

```bash
# Log into MySQL as root
sudo mysql -u root -p
```

In the MySQL prompt, run these commands (replace 'your_password' with a secure password):

```sql
CREATE DATABASE rulimena;
CREATE USER 'rulimena_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON rulimena.* TO 'rulimena_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 8. Install Redis

```bash
sudo apt install -y redis-server

# Start and enable Redis service
sudo systemctl start redis
sudo systemctl enable redis
```

### 9. Clone the Application Repository

```bash
# Navigate to your preferred directory (e.g., home directory)
cd ~

# Clone the repository (replace with your actual repository URL)
git clone https://github.com/your-username/rulimena-backend.git

# Navigate to the project directory
cd rulimena-backend
```

### 10. Install Application Dependencies

```bash
npm install
```

### 11. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the .env file with your preferred text editor (nano, vim, etc.):

```bash
nano .env
```

Update the following values:
- DB_HOST=localhost
- DB_USER=rulimena_user
- DB_PASSWORD=your_password (the password you set in step 7)
- DB_NAME=rulimena
- JWT_SECRET=your_jwt_secret_here (use a strong random string)
- REDIS_HOST=localhost

Save and exit the editor (Ctrl+X, then Y, then Enter for nano).

### 12. Run Database Migration

```bash
npm run migrate
```

### 13. Test the Application

```bash
# Run the MySQL test script
npm run test-mysql
```

If the test passes, you should see "MySQL implementation test completed successfully!"

### 14. Install PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
pm2 start rulimena-backend/src/app.js --name rulimena-backend

# Save the PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

Follow the instructions provided by the `pm2 startup` command to complete the setup.

### 15. Configure Firewall (if using UFW)

```bash
# Allow SSH, HTTP, and HTTPS traffic
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw --force enable
```

### 16. Set Up Reverse Proxy with Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/rulimena-backend
```

Add the following configuration to the file:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
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
}
```

Replace `your_domain_or_ip` with your actual domain or VPS IP address.

Enable the site and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rulimena-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### 17. Access the Application

Your application should now be accessible at:
- Direct access: http://your_vps_ip:3000
- Through Nginx reverse proxy: http://your_domain_or_ip

### 18. Monitoring and Maintenance

To monitor your application:

```bash
# Check application logs
pm2 logs rulimena-backend

# Check application status
pm2 status

# Restart application if needed
pm2 restart rulimena-backend

# Stop application
pm2 stop rulimena-backend
```

## Troubleshooting

### Database Connection Issues

1. Verify MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

2. Check MySQL error logs:
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```

3. Test MySQL connection:
   ```bash
   mysql -u rulimena_user -p rulimena
   ```

### Application Issues

1. Check application logs:
   ```bash
   pm2 logs rulimena-backend
   ```

2. Check if the application is running:
   ```bash
   pm2 status
   ```

3. Restart the application:
   ```bash
   pm2 restart rulimena-backend
   ```

### Nginx Issues

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Updating the Application

To update the application when new code is available:

```bash
# Navigate to the project directory
cd ~/rulimena-backend

# Pull the latest changes
git pull

# Install any new dependencies
npm install

# Run database migrations if needed
npm run migrate

# Restart the application
pm2 restart rulimena-backend
```

## Backup and Recovery

### Database Backup

```bash
# Create a database backup
mysqldump -u rulimena_user -p rulimena > rulimena_backup_$(date +%F).sql
```

### Database Restore

```bash
# Restore a database backup
mysql -u rulimena_user -p rulimena < rulimena_backup.sql
```

## Conclusion

Your rulimena-backend application is now deployed and running on your Ubuntu 22.04 VPS. The application is managed by PM2 for automatic restarts and is optionally accessible through an Nginx reverse proxy.

Remember to:
1. Regularly update your system and application
2. Monitor application logs for any issues
3. Maintain database backups
4. Secure your server with proper firewall rules