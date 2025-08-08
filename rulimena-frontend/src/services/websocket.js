import io from 'socket.io-client';
import { store } from '../redux/store';
import { logout } from '../redux/authSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = {};
    this.token = null;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.token = token;
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
    
    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected');
      
      // If it's not a manual disconnect, try to reconnect
      if (reason !== 'io client disconnect') {
        this.attemptReconnect(token);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', error);
    });

    // Handle authentication errors
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (error.message === 'Authentication required' || error.message === 'Invalid token') {
        // Dispatch logout action to clear auth state
        store.dispatch(logout());
      }
      this.emit('error', error);
    });

    // Handle real-time events
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Agent status updates
    this.socket.on('agent-status-update', (data) => {
      console.log('Agent status update:', data);
      this.emit('agent-status-update', data);
    });

    // Call events
    this.socket.on('call-connected', (data) => {
      console.log('Call connected:', data);
      this.emit('call-connected', data);
    });

    this.socket.on('call-ended', (data) => {
      console.log('Call ended:', data);
      this.emit('call-ended', data);
    });

    // Campaign events
    this.socket.on('campaign-started', (data) => {
      console.log('Campaign started:', data);
      this.emit('campaign-started', data);
    });

    this.socket.on('campaign-stopped', (data) => {
      console.log('Campaign stopped:', data);
      this.emit('campaign-stopped', data);
    });

    // Dashboard events
    this.socket.on('dashboard-stats-update', (data) => {
      console.log('Dashboard stats update:', data);
      this.emit('dashboard-stats-update', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('Notification:', data);
      this.emit('notification', data);
    });
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      // Socket.IO handles reconnection automatically, but we can add custom logic here if needed
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect(token);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
      this.emit('reconnectFailed');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.token = null;
    }
  }

  // Join a specific room
  joinRoom(room) {
    if (this.isConnected && this.socket) {
      this.socket.emit('join-room', room);
    }
  }

  // Leave a specific room
  leaveRoom(room) {
    if (this.isConnected && this.socket) {
      this.socket.emit('leave-room', room);
    }
  }

  // Send agent status update
  sendAgentStatusUpdate(data) {
    if (this.isConnected && this.socket) {
      this.socket.emit('agent-status-update', data);
    }
  }

  // Send call events
  sendCallConnected(data) {
    if (this.isConnected && this.socket) {
      this.socket.emit('call-connected', data);
    }
  }

  sendCallEnded(data) {
    if (this.isConnected && this.socket) {
      this.socket.emit('call-ended', data);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new WebSocketService();