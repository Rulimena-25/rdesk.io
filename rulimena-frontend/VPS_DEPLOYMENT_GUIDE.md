# VPS Deployment Guide for rulimena-frontend

This guide provides step-by-step instructions for deploying the rulimena-frontend React application on your Ubuntu 22.04 VPS via SSH. This frontend connects to the rulimena-backend API and provides the user interface for the predictive dialer system.

## Prerequisites

- Ubuntu 22.04 VPS
- SSH access to your VPS
- sudo privileges
- Backend API deployed and accessible (see rulimena-backend/VPS_DEPLOYMENT_GUIDE.md)

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

### 5. Clone the Application Repository

```bash
# Navigate to your preferred directory (e.g., home directory)
cd ~

# Clone the repository (replace with your actual repository URL)
git clone https://github.com/your-username/rulimena-frontend.git

# Navigate to the project directory
cd rulimena-frontend
```

### 6. Install Application Dependencies

```bash
npm install
```

### 7. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the .env file with your preferred text editor (nano, vim, etc.):

```bash
nano .env
```

Update the following values:
- REACT_APP_API_URL=https://your_domain_or_ip/api (URL of your backend API)
- REACT_APP_WS_URL=wss://your_domain_or_ip (WebSocket URL of your backend)

For example:
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_WS_URL=wss://your-domain.com
```

Save and exit the editor (Ctrl+X, then Y, then Enter for nano).

### 8. Build the Application for Production

```bash
npm run build
```

This will create an optimized production build in the `build/` directory.

### 9. Serve the Application with Nginx

#### Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx service
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Create Nginx Configuration

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/rulimena-frontend
```

Add the following configuration to the file:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    # Root directory for the React app build
    root /home/your_username/rulimena-frontend/build;
    index index.html index.htm;

    # Serve static files directly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Add security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Optional: Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

Replace `your_domain_or_ip` with your actual domain or VPS IP address, and `your_username` with your actual username.

Enable the site and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rulimena-frontend /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 10. Set Up SSL Certificate with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 11. Configure Firewall (if using UFW)

```bash
# Allow SSH, HTTP, and HTTPS traffic
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw --force enable
```

### 12. Access the Application

Your frontend application should now be accessible at:
- HTTP: http://your_domain_or_ip
- HTTPS (if SSL configured): https://your_domain_or_ip

## Updating the Application

To update the application when new code is available:

```bash
# Navigate to the project directory
cd ~/rulimena-frontend

# Pull the latest changes
git pull

# Install any new dependencies
npm install

# Update environment variables if needed
nano .env

# Rebuild the application
npm run build

# Restart Nginx to clear cache
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### Check Nginx Status

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Application Health Checks

To verify the frontend is working correctly:
1. Visit your domain/IP in a browser
2. Check that all pages load without errors
3. Verify login functionality works
4. Confirm WebSocket connections are established

## Troubleshooting

### Application Issues

1. Check browser console for JavaScript errors (F12 Developer Tools)
2. Verify API endpoints are accessible
3. Confirm environment variables are correctly set
4. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Nginx Configuration Issues

1. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

2. Restart Nginx if configuration was updated:
   ```bash
   sudo systemctl restart nginx
   ```

3. Check Nginx service status:
   ```bash
   sudo systemctl status nginx
   ```

### Build Issues

1. Clean node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. Check for build errors in the terminal output

### SSL Certificate Issues

1. Check certificate expiration:
   ```bash
   sudo certbot certificates
   ```

2. Renew certificate manually:
   ```bash
   sudo certbot renew
   ```

## Performance Optimization

### Nginx Caching

To improve performance, you can add caching to your Nginx configuration:

```nginx
# Add to your server block
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

### Service Workers (if implemented)

If your application uses service workers, ensure they're properly configured for production deployment.

## Backup and Recovery

### Application Code Backup

```bash
# Create a backup of the application code
tar -czf rulimena-frontend-backup-$(date +%F).tar.gz ~/rulimena-frontend
```

### Environment Variables Backup

```bash
# Backup environment variables
cp ~/rulimena-frontend/.env ~/rulimena-frontend/.env.backup
```

## Conclusion

Your rulimena-frontend application is now deployed and running on your Ubuntu 22.04 VPS. The application is served by Nginx and can be accessed through your domain or IP address.

Remember to:
1. Regularly update your system and application
2. Monitor application logs for any issues
3. Maintain backups of your code and configuration
4. Keep SSL certificates renewed
5. Secure your server with proper firewall rules

For issues with the backend API or WebSocket connections, refer to the rulimena-backend deployment guide.