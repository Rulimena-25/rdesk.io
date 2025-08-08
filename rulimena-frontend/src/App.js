import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import Dialer from './pages/Dialer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import websocketService from './services/websocket';
import './App.css';

function App() {
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      websocketService.connect(token);
    }

    // Clean up WebSocket connection on unmount
    return () => {
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/dialer" element={<ProtectedRoute><Dialer /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;