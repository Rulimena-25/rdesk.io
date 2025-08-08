# rulimena-backend Development Plan

## Project Structure

```
rulimena-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   └── campaignController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Contact.js
│   │   └── Campaign.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   └── campaignRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── contactService.js
│   │   └── campaignService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── websocket.js
│   └── app.js
├── config/
│   ├── database.js
│   ├── redis.js
│   └── websocket.js
├── tests/
├── package.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Key Implementation Components

### 1. Authentication System
- JWT-based authentication endpoints (/auth/login, /auth/register)
- Password hashing with bcrypt
- Role-based access control middleware (admin, supervisor, agent)
- Session management with Redis

### 2. Contact Management
- CRUD endpoints for contacts
- Contact upload functionality (CSV/XLSX)
- Data validation and duplicate detection

### 3. Campaign Management
- CRUD endpoints for campaigns
- Campaign lifecycle management (draft, active, paused, completed)
- Campaign start/stop functionality

### 4. WebSocket Integration
- Socket.IO server with Redis adapter for scaling
- Real-time event handling for calls and agent status
- Room management for different user roles

## Development Steps

1. Set up project structure and dependencies
2. Configure environment variables and database connections
3. Implement database models (User, Contact, Campaign)
4. Create authentication controllers and middleware
5. Implement contact management controllers
6. Implement campaign management controllers
7. Set up WebSocket server and event handlers
8. Create API routes and integrate with controllers
9. Implement error handling and validation
10. Set up testing framework and write unit tests