import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFromToken } from '../../redux/authSlice';
import api from '../../services/api';
import websocketService from '../../services/websocket';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      // If we have a token but aren't authenticated, try to validate it
      if (token && !isAuthenticated) {
        try {
          // Try to get user info from the /auth/me endpoint
          const response = await api.get('/auth/me');
          
          // If successful, set user in Redux
          dispatch(setUserFromToken({ user: response.data.data, token }));
          
          // Connect WebSocket
          websocketService.connect(token);
        } catch (error) {
          // If token is invalid, remove it and redirect to login
          localStorage.removeItem('token');
          // Disconnect WebSocket
          websocketService.disconnect();
          navigate('/login');
        }
      }
      // If no token, redirect to login
      else if (!token) {
        // Disconnect WebSocket
        websocketService.disconnect();
        navigate('/login');
      }
    };

    checkAuth();
  }, [token, isAuthenticated, dispatch, navigate]);

  // Show loading state while checking auth
  if (!isAuthenticated && token) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated and no token, redirect will happen via effect
  return null;
};

export default ProtectedRoute;