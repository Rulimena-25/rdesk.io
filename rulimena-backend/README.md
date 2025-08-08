# rulimena-backend

Backend API for the rulimena.io predictive dialer system.

## Database Migration to MySQL

This backend has been migrated from MongoDB to MySQL. See [MYSQL_SETUP.md](MYSQL_SETUP.md) for setup instructions.

## Overview

This is the backend component of the rulimena.io system, built with Node.js and Express. It provides RESTful APIs for user authentication, contact management, campaign management, and real-time communication via WebSocket.

## Features

- User authentication with JWT
- Role-based access control (admin, supervisor, agent)
- Contact management (CRUD operations)
- Campaign management (creation, scheduling, monitoring)
- Real-time communication via WebSocket
- Session management with Redis

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MySQL**: Primary database (migrated from MongoDB)
- **Redis**: Session management and caching
- **Socket.IO**: Real-time communication
- **JWT**: Authentication
- **bcrypt**: Password hashing

## Project Structure

```
rulimena-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── tests/
├── package.json
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

5. Set up MySQL database (see [MYSQL_SETUP.md](MYSQL_SETUP.md))

6. Run database migration:
   ```bash
   npm run migrate
   ```

7. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with existing credentials

## Development

### Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in development mode with nodemon
- `npm run migrate` - Run database migration
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.