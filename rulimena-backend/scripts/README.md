# Admin User Management Scripts

This directory contains scripts for managing admin users in the rulimena.io system.

## Prerequisites

Before running these scripts, ensure you have:

1. MySQL installed and running
2. Database configured according to the `.env` file
3. Required Node.js dependencies installed (`npm install`)

## Scripts

### check-admin-user.js

Checks if the admin user exists in the database.

```bash
npm run check-admin
```

This script will:
- Connect to the database
- Look for a user with username 'SuperAdmin' or email 'anderson@rdesk.io'
- Display information about the user if found
- Indicate if no admin user exists

### create-admin-user.js

Creates the admin user if one doesn't already exist.

```bash
npm run create-admin
```

This script will:
- Connect to the database
- Check if an admin user already exists
- Create the admin user with the following details if not found:
  - Firstname: Anderson
  - Lastname: Soplanit
  - Username: SuperAdmin
  - Email: anderson@rdesk.io
  - Password: rdesk0505
  - Phone Number: 628123351700
  - Role: admin

## Usage Instructions

1. Ensure MySQL is running:
   ```bash
   # On Windows
   net start MySQL
   
   # On macOS/Linux
   sudo service mysql start
   ```

2. Run the check script to see if admin user exists:
   ```bash
   npm run check-admin
   ```

3. If no admin user exists, create one:
   ```bash
   npm run create-admin
   ```

4. Verify the admin user was created:
   ```bash
   npm run check-admin
   ```

## Troubleshooting

If you encounter connection errors:

1. Verify MySQL is running
2. Check your `.env` file database configuration
3. Ensure the database `rulimena` exists
4. Confirm your MySQL user has proper permissions

If you encounter authentication errors:
1. Verify the password in the create script matches your requirements
2. Check that bcrypt is properly installed (`npm install bcrypt`)

## Adding Dummy Contacts for Testing

To add dummy contacts for testing purposes, run:

```bash
npm run add-dummy-contacts
```

This script will:
- Add 5 dummy contacts with realistic data
- Assign appropriate scores and statuses
- Link contacts to the admin user if available

The dummy contacts include:
- John Doe (Tech Solutions Inc.)
- Jane Smith (Marketing Pro LLC)
- Robert Johnson (Finance Group)
- Emily Williams (Healthcare Plus)
- Michael Brown (Education First)