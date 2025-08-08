# rulimena-frontend

Frontend application for rulimena.io - A smart predictive dialer system.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## About

rulimena-frontend is the React-based frontend application for rulimena.io, a smart predictive dialer system designed for call centers and telemarketing operations. This application provides a comprehensive interface for managing contacts, campaigns, and real-time dialing operations.

## Features

- User authentication (login/register)
- Dashboard with real-time metrics
- Contact management (CRUD operations)
- Campaign management (creation, monitoring, control)
- Manual and turbo dialer interfaces
- Real-time WebSocket integration
- Role-based access control
- Responsive design

## Technologies

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Router](https://reactrouter.com/) - Declarative routing
- [Axios](https://axios-http.com/) - HTTP client
- [Ant Design](https://ant.design/) - UI component library
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Socket.IO](https://socket.io/) - Real-time communication

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rulimena-frontend.git
   ```

2. Navigate to the project directory:
   ```bash
   cd rulimena-frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

## Project Structure

```
rulimena-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── campaigns/
│   │   └── dialer/
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Contacts.js
│   │   ├── Campaigns.js
│   │   └── Dialer.js
│   ├── redux/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── contactsSlice.js
│   │   └── campaignsSlice.js
│   ├── services/
│   │   ├── api.js
│   │   └── websocket.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Removes the single build dependency

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_NAME=rulimena.io
REACT_APP_DESCRIPTION=Smart Predictive Dialer System
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.