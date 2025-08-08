# rulimena.io Development Phase Plan

## Overview

This document outlines the implementation approach for the development phase of rulimena.io, a smart predictive dialer system. Based on the existing architectural documentation and your preference to use the established technology stack, this plan focuses on setting up the development environment and implementing core functionality.

## Project Structure

We'll create three separate Git repositories as requested:

1. **rulimena-backend** - Node.js + Express API
2. **rulimena-frontend** - React + Ant Design
3. **rulimena-docs** - Documentation

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: Primary database
- **Redis**: Session management and caching
- **Socket.IO**: Real-time communication
- **JWT**: Authentication

### Frontend
- **React.js**: UI library
- **Ant Design**: Component library
- **Redux**: State management
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time communication
- **Chart.js**: Data visualization

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Jest**: Testing framework

## Phase 1: Environment Setup (Week 1)

### Objectives
- Establish development environment
- Create project repositories
- Set up development tools
- Implement basic project structure

### Tasks

#### 1. Repository Setup
- Create `rulimena-backend` repository
- Create `rulimena-frontend` repository
- Create `rulimena-docs` repository
- Initialize with README files
- Set up .gitignore files

#### 2. Backend Project Structure
```
rulimena-backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── config/
├── tests/
├── package.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

#### 3. Frontend Project Structure
```
rulimena-frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── services/
│   ├── utils/
│   ├── App.js
│   └── index.js
├── tests/
├── package.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

#### 4. Development Tooling
- Configure ESLint with Airbnb style guide
- Set up Prettier for code formatting
- Implement Husky for pre-commit hooks
- Configure Jest for testing

## Phase 2: Authentication System (Week 2)

### Objectives
- Implement user registration and login
- Create JWT-based authentication
- Implement role-based access control

### Tasks

#### 1. User Authentication API
- Create `/api/auth/register` endpoint
- Create `/api/auth/login` endpoint
- Create `/api/auth/logout` endpoint
- Implement password reset functionality

#### 2. Security Implementation
- Implement bcrypt for password hashing
- Set up JWT token generation and validation
- Create middleware for authentication verification
- Implement rate limiting for auth endpoints

#### 3. Role-based Access Control
- Create middleware functions for role checking:
  - `requireAdmin`
  - `requireSupervisorOrAdmin`
  - `requireAgent`
- Implement session management with Redis

## Phase 3: Core Backend APIs (Weeks 3-4)

### Objectives
- Implement contact management system
- Create campaign management functionality
- Set up WebSocket for real-time communication

### Tasks

#### 1. Contact Management API
- Create CRUD endpoints for contacts:
  - GET `/api/contacts`
  - POST `/api/contacts`
  - GET `/api/contacts/:id`
  - PUT `/api/contacts/:id`
  - DELETE `/api/contacts/:id`
- Implement contact import functionality:
  - CSV/XLSX file upload endpoint
  - Data validation and cleaning
  - Duplicate detection and handling

#### 2. Campaign Management API
- Create CRUD endpoints for campaigns:
  - GET `/api/campaigns`
  - POST `/api/campaigns`
  - GET `/api/campaigns/:id`
  - PUT `/api/campaigns/:id`
  - DELETE `/api/campaigns/:id`
- Implement campaign lifecycle management:
  - Draft, Scheduled, Active, Paused, Completed states
  - Start/stop control functionality

#### 3. WebSocket Implementation
- Implement Socket.IO server with Redis adapter
- Create event handling system for:
  - Agent events (status updates, call started/ended)
  - Call events (queued, ringing, connected, disconnected)
  - Campaign events (started, paused, completed)
- Implement room management for different user roles

## Phase 4: Frontend Development (Weeks 5-6)

### Objectives
- Create authentication interface
- Implement admin dashboard
- Build dialer interfaces

### Tasks

#### 1. Authentication Pages
- Create login page with form validation
- Create registration page
- Implement JWT token management (localStorage)
- Create protected routes based on user roles

#### 2. Admin Dashboard
- Create responsive dashboard layout
- Implement real-time call metrics widget
- Create agent status overview widget
- Implement campaign performance widget
- Add system health monitoring

#### 3. Dialer Interface
- Create manual dialer interface:
  - Contact information panel
  - Dial pad and call controls
  - Call script presentation area
  - Note-taking functionality
- Create turbo dialer interface:
  - Queue management visualization
  - Active call display
  - Performance dashboard

## Phase 5: Integration & Testing (Week 7)

### Objectives
- Connect frontend to backend
- Test core functionality
- Perform manual testing of workflows

### Tasks

#### 1. API Integration
- Connect React frontend to Node.js backend via Axios
- Implement error handling for API calls
- Set up authentication flow between frontend and backend
- Test real-time updates with WebSocket

#### 2. Testing
- Perform manual testing of core workflows:
  - User registration and login
  - Contact upload and management
  - Campaign creation and execution
  - Call initiation and monitoring
- Verify role-based access control
- Test real-time updates and notifications

## Development Timeline

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Environment Setup | Git repositories, project structure, development tools |
| 2 | Authentication | User auth system, JWT implementation, RBAC |
| 3 | Contact Management | Contact CRUD, import functionality |
| 4 | Campaign & WebSocket | Campaign management, real-time communication |
| 5 | Frontend Auth & Dashboard | Login pages, admin dashboard |
| 6 | Dialer Interface | Manual and turbo dialer interfaces |
| 7 | Integration & Testing | Full system integration, testing |

## Success Criteria

By the end of this development phase, we should have:
1. Three separate, functional Git repositories
2. Working authentication system with role-based access control
3. Contact management with CRUD operations and import functionality
4. Campaign management system with lifecycle controls
5. Real-time communication via WebSocket
6. Basic frontend interfaces for all core functionality
7. Integrated system with successful API communication
8. Tested core workflows functioning correctly

## Next Steps

After completing this initial development phase, we'll move on to implementing more advanced features as outlined in the full implementation roadmap, including:
- Predictive dialing algorithms
- CRM integration
- Advanced analytics and reporting
- Performance optimization
- Security enhancements