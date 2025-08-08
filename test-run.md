# Testing rulimena.io System

## Prerequisites

Before running the test, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- Redis

## Backend Testing

1. Navigate to the backend directory:
   ```bash
   cd rulimena-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/rulimena
   MONGODB_USER=
   MONGODB_PASSWORD=

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=24h

   # Application Configuration
   APP_NAME=rulimena-backend
   ```

5. Start MongoDB and Redis services on your system.

6. Start the backend server:
   ```bash
   npm run dev
   ```

7. Verify the backend is running by accessing:
   - http://localhost:3000/ (should return API information)
   - http://localhost:3000/api/auth/register (auth endpoint)

## Frontend Testing

1. Navigate to the frontend directory:
   ```bash
   cd rulimena-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   touch .env
   ```

4. Add the following to the `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   REACT_APP_WS_URL=http://localhost:3000
   ```

5. Start the frontend development server:
   ```bash
   npm start
   ```

6. The frontend should automatically open in your browser at:
   - http://localhost:3001 (or another port if 3001 is taken)

## Testing the Complete System

1. With both backend and frontend running:
   - Register a new user through the frontend
   - Login with the registered user
   - Test contact upload with a sample Excel/CSV file
   - Verify real-time updates through WebSocket

2. Sample data for testing contact upload:
   Create a simple Excel or CSV file with columns like:
   ```
   CustomerID,CustomerName,AgentID,ProductID,Phone,Email
   1,John Doe,Agent001,Product001,628123456789,john@example.com
   2,Jane Smith,Agent002,Product002,081298765432,jane@example.com
   ```

## Troubleshooting

### Common Issues:

1. **Port conflicts**: If ports 3000 or 3001 are already in use, update the PORT values in `.env` files.

2. **Database connection errors**: 
   - Ensure MongoDB is running
   - Verify the MONGODB_URI in the backend `.env` file
   - Check MongoDB credentials if authentication is enabled

3. **Redis connection errors**:
   - Ensure Redis is running
   - Verify REDIS_HOST and REDIS_PORT in the backend `.env` file

4. **CORS errors**: The backend already has CORS enabled, but if you encounter issues, check the `app.js` file.

5. **WebSocket connection issues**: 
   - Ensure the backend server is running
   - Verify REACT_APP_WS_URL in the frontend `.env` file

### Testing API Endpoints:

You can test backend API endpoints using curl or Postman:

1. **Register a user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "password123"
     }'
   ```

3. **Get contacts** (requires authentication):
   ```bash
   curl -X GET http://localhost:3000/api/contacts \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Next Steps

After successful testing:
1. You can begin using the system with your actual data
2. Customize the frontend UI as needed
3. Add additional features based on your requirements
4. Deploy to production environment when ready