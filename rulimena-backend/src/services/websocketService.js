// WebSocket service for emitting events

// Import the initialized io instance
const { io } = require('../app');

// Emit event to all connected clients
const emitToAll = (event, data) => {
  io.emit(event, data);
};

// Emit event to a specific room
const emitToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

// Emit event to a specific user
const emitToUser = (userId, event, data) => {
  // This would require storing user socket connections
  // For now, we'll emit to a user-specific room
  io.to(`user-${userId}`).emit(event, data);
};

// Emit call connected event
const emitCallConnected = (data) => {
  // Emit to supervisor and admin rooms
  io.to('supervisor-room').to('admin-room').emit('call-connected', {
    ...data,
    timestamp: new Date()
  });
};

// Emit call ended event
const emitCallEnded = (data) => {
  // Emit to supervisor and admin rooms
  io.to('supervisor-room').to('admin-room').emit('call-ended', {
    ...data,
    timestamp: new Date()
  });
};

// Emit agent status update
const emitAgentStatusUpdate = (agentId, data) => {
  // Emit to supervisor and admin rooms
  io.to('supervisor-room').to('admin-room').emit('agent-status-update', {
    agentId,
    ...data,
    timestamp: new Date()
  });
};

// Emit campaign started event
const emitCampaignStarted = (data) => {
  io.to('supervisor-room').to('admin-room').emit('campaign-started', {
    ...data,
    timestamp: new Date()
  });
};

// Emit campaign stopped event
const emitCampaignStopped = (data) => {
  io.to('supervisor-room').to('admin-room').emit('campaign-stopped', {
    ...data,
    timestamp: new Date()
  });
};

module.exports = {
  emitToAll,
  emitToRoom,
  emitToUser,
  emitCallConnected,
  emitCallEnded,
  emitAgentStatusUpdate,
  emitCampaignStarted,
  emitCampaignStopped
};