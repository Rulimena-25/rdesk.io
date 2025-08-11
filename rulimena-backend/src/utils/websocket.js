const socketIO = require('socket.io');
const { authenticate } = require('../middleware/authMiddleware');

// Store active connections
const activeConnections = new Map();

const initializeWebSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Use Redis adapter for scaling (when Redis is configured)
  // io.adapter(require('socket.io-redis')({ host: 'localhost', port: 6379 }));

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.userId} connected with role ${socket.user.role}`);
    
    // Store active connection
    activeConnections.set(socket.user.userId, socket);
    
    // Join user to appropriate rooms based on role
    switch (socket.user.role) {
      case 'admin':
        socket.join('admin-room');
        socket.join('supervisor-room');
        socket.join('agent-room');
        break;
      case 'supervisor':
        socket.join('supervisor-room');
        socket.join('agent-room');
        break;
      case 'agent':
        socket.join('agent-room');
        break;
    }

    // Handle room joining
    socket.on('join-room', (room) => {
      // Validate room access based on user role
      if (canJoinRoom(socket.user.role, room)) {
        socket.join(room);
        console.log(`User ${socket.user.userId} joined room ${room}`);
      } else {
        socket.emit('error', { message: 'Insufficient permissions to join room' });
      }
    });

    // Handle room leaving
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.user.userId} left room ${room}`);
    });

    // Handle call connected event
    socket.on('call-connected', (data) => {
      // Emit to relevant rooms
      io.to('supervisor-room').to('admin-room').emit('call-connected', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle call ended event
    socket.on('call-ended', (data) => {
      // Emit to relevant rooms
      io.to('supervisor-room').to('admin-room').emit('call-ended', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle agent status update
    socket.on('agent-status-update', (data) => {
      // Emit to relevant rooms
      io.to('supervisor-room').to('admin-room').emit('agent-status-update', {
        agentId: socket.user.userId,
        ...data,
        timestamp: new Date()
      });
    });

    // Handle campaign events
    socket.on('campaign-started', (data) => {
      io.to('supervisor-room').to('admin-room').emit('campaign-started', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('campaign-stopped', (data) => {
      io.to('supervisor-room').to('admin-room').emit('campaign-stopped', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle dial request from frontend
    socket.on('dial-request', async (data) => {
      try {
        const { phoneNumber, campaignId, contactId } = data;
        
        // Validate required fields
        if (!phoneNumber) {
          socket.emit('dial-error', { message: 'Phone number is required' });
          return;
        }

        // Import SIP service here to avoid circular dependencies
        const sipService = require('../services/sipService');
        
        // Make the call using SIP service
        const call = await sipService.makeCall(
          phoneNumber,
          socket.user.userId,
          campaignId,
          contactId
        );
        
        // Emit success response
        socket.emit('dial-success', {
          callId: call.id,
          phoneNumber,
          message: 'Call initiated successfully'
        });
        
        console.log(`Call initiated by user ${socket.user.userId} to ${phoneNumber}`);
      } catch (error) {
        console.error('Error making call:', error);
        socket.emit('dial-error', {
          message: 'Failed to initiate call',
          error: error.message
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.userId} disconnected`);
      activeConnections.delete(socket.user.userId);
    });
  });

  // Function to check if user can join a room
  const canJoinRoom = (role, room) => {
    // Admins can join any room
    if (role === 'admin') return true;
    
    // Supervisors can join supervisor and agent rooms
    if (role === 'supervisor' && (room === 'supervisor-room' || room === 'agent-room')) {
      return true;
    }
    
    // Agents can only join agent room
    if (role === 'agent' && room === 'agent-room') {
      return true;
    }
    
    return false;
  };

  // Function to emit event to specific user
  const emitToUser = (userId, event, data) => {
    const socket = activeConnections.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Function to emit event to room
  const emitToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
  };

  return {
    io,
    emitToUser,
    emitToRoom
  };
};

module.exports = {
  initializeWebSocket,
  activeConnections
};