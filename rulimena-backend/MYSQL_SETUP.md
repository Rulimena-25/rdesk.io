# MySQL Setup Guide for rulimena-backend

This guide provides instructions for setting up MySQL on your Ubuntu 22.04 VPS for the rulimena-backend application.

## Prerequisites

- Ubuntu 22.04 VPS
- sudo privileges

## 1. Install MySQL Server

```bash
sudo apt update
sudo apt install mysql-server
```

## 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to set up the root password and security options.

## 3. Start and Enable MySQL Service

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 4. Create Database and User

Log into MySQL as root:

```bash
sudo mysql -u root -p
```

Create the database and user (replace 'your_password' with a secure password):

```sql
CREATE DATABASE rulimena;
CREATE USER 'rulimena_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON rulimena.* TO 'rulimena_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 5. Update Environment Variables

Update your `.env` file with the new database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=rulimena_user
DB_PASSWORD=your_password
DB_NAME=rulimena
DB_PORT=3306
```

## 6. Run Database Migration

Navigate to the backend directory and run the migration:

```bash
cd /path/to/rulimena-backend
npm run migrate
```

## 7. Start the Application

```bash
npm start
```

Or for development:

```bash
npm run dev
```

## Troubleshooting

If you encounter connection issues:

1. Verify MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

2. Check if you can connect to MySQL:
   ```bash
   mysql -u rulimena_user -p rulimena
   ```

3. Verify firewall settings if connecting remotely:
   ```bash
   sudo ufw allow mysql
   ```

4. Check MySQL error logs:
   ```bash
   sudo tail -f /var/log/mysql/error.log