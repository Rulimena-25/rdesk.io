const sip = require('sip');
const ami = require('asterisk-manager');
const sipConfig = require('../config/sipConfig');
const { emitCallConnected, emitCallEnded } = require('./websocketService');
const Call = require('../models/Call');
const CallLog = require('../models/CallLog');

class SIPService {
  constructor() {
    this.sipStack = null;
    this.amiClient = null;
    this.calls = new Map(); // Track active calls
    this.isInitialized = false;
  }

  /**
   * Initialize SIP service
   */
  async initialize() {
    try {
      console.log('Initializing SIP service...');
      
      // Initialize SIP stack
      this.sipStack = sip.create({
        port: sipConfig.sip.port,
        address: sipConfig.sip.localAddress,
        publicAddress: sipConfig.sip.publicAddress || undefined
      }, this.handleSipMessage.bind(this));
      
      // Initialize Asterisk Manager Interface (AMI)
      this.amiClient = new ami(
        sipConfig.ami.port,
        sipConfig.ami.host,
        sipConfig.ami.username,
        sipConfig.ami.password,
        true // reconnect
      );
      
      // Set up AMI event handlers
      this.setupAmiEventHandlers();
      
      this.isInitialized = true;
      console.log('SIP service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize SIP service:', error);
      throw error;
    }
  }
  
  /**
   * Set up AMI event handlers
   */
  setupAmiEventHandlers() {
    if (!this.amiClient) return;
    
    // Handle connection events
    this.amiClient.on('connect', () => {
      console.log('Connected to Asterisk AMI');
    });
    
    this.amiClient.on('disconnect', () => {
      console.log('Disconnected from Asterisk AMI');
    });
    
    // Handle call events
    this.amiClient.on('userevent', (event) => {
      this.handleUserEvent(event);
    });
    
    this.amiClient.on('newchannel', (event) => {
      this.handleNewChannel(event);
    });
    
    this.amiClient.on('hangup', (event) => {
      this.handleHangup(event);
    });
    
    this.amiClient.on('dial', (event) => {
      this.handleDialEvent(event);
    });
    
    this.amiClient.on('dialstatus', (event) => {
      this.handleDialStatus(event);
    });
  }
  
  /**
   * Handle SIP messages
   */
  handleSipMessage(request, remote) {
    try {
      // Handle incoming SIP requests
      switch (request.method) {
        case 'INVITE':
          this.handleInvite(request, remote);
          break;
        case 'ACK':
          this.handleAck(request, remote);
          break;
        case 'BYE':
          this.handleBye(request, remote);
          break;
        case 'CANCEL':
          this.handleCancel(request, remote);
          break;
        default:
          // Send method not allowed for unsupported methods
          this.sipStack.send({
            method: 'NOTIFY',
            uri: request.headers.contact ? request.headers.contact[0].uri : '',
            headers: {
              to: request.headers.to,
              from: request.headers.from,
              'call-id': request.headers['call-id'],
              cseq: { seq: request.headers.cseq.seq + 1, method: 'NOTIFY' }
            },
            status: 405,
            reason: 'Method Not Allowed'
          });
          break;
      }
    } catch (error) {
      console.error('Error handling SIP message:', error);
    }
  }
  
  /**
   * Handle SIP INVITE requests
   */
  handleInvite(request, remote) {
    // For now, we'll automatically accept all calls
    const response = {
      method: 'INVITE',
      uri: request.uri,
      headers: {
        to: request.headers.to,
        from: request.headers.from,
        'call-id': request.headers['call-id'],
        cseq: request.headers.cseq,
        'www-authenticate': 'Digest realm="rulimena.io", nonce="abc123"'
      },
      status: 401,
      reason: 'Unauthorized'
    };
    
    this.sipStack.send(response, remote);
  }
  
  /**
   * Handle SIP ACK requests
   */
  handleAck(request, remote) {
    // ACK is just an acknowledgment, no response needed
    console.log('Received SIP ACK');
  }
  
  /**
   * Handle SIP BYE requests
   */
  handleBye(request, remote) {
    // Send OK response
    this.sipStack.send({
      method: 'BYE',
      uri: request.uri,
      headers: {
        to: request.headers.to,
        from: request.headers.from,
        'call-id': request.headers['call-id'],
        cseq: request.headers.cseq
      },
      status: 200,
      reason: 'OK'
    }, remote);
    
    // End the call
    const callId = request.headers['call-id'];
    this.endCall(callId);
  }
  
  /**
   * Handle SIP CANCEL requests
   */
  handleCancel(request, remote) {
    // Send OK response
    this.sipStack.send({
      method: 'CANCEL',
      uri: request.uri,
      headers: {
        to: request.headers.to,
        from: request.headers.from,
        'call-id': request.headers['call-id'],
        cseq: request.headers.cseq
      },
      status: 200,
      reason: 'OK'
    }, remote);
  }
  
  /**
   * Handle AMI user events
   */
  handleUserEvent(event) {
    console.log('AMI User Event:', event);
    // Handle custom user events from Asterisk
  }
  
  /**
   * Handle new channel events
   */
  handleNewChannel(event) {
    console.log('New Channel:', event);
    // Track new calls
  }
  
  /**
   * Handle hangup events
   */
  handleHangup(event) {
    console.log('Call Hangup:', event);
    // Update call status and emit events
  }
  
  /**
   * Handle dial events
   */
  handleDialEvent(event) {
    console.log('Dial Event:', event);
    // Track dialing progress
  }
  
  /**
   * Handle dial status events
   */
  handleDialStatus(event) {
    console.log('Dial Status:', event);
    // Handle dialing results
  }
  
  /**
   * Make an outbound call
   */
  async makeCall(phoneNumber, agentId, campaignId = null, contactId = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('SIP service not initialized');
      }
      
      // Create call record in database
      const callData = {
        campaignId: campaignId,
        contactId: contactId,
        agentId: agentId,
        phoneNumber: phoneNumber,
        status: 'initiated',
        direction: 'outbound'
      };
      
      const call = await Call.create(callData);
      
      // Track the call
      this.calls.set(call.id, {
        id: call.id,
        phoneNumber: phoneNumber,
        agentId: agentId,
        status: 'initiated',
        startTime: new Date()
      });
      
      // Send dial command to Asterisk
      this.amiClient.action({
        'action': 'Originate',
        'channel': `SIP/${phoneNumber}`,
        'context': 'rulimena-outbound',
        'exten': phoneNumber,
        'priority': 1,
        'callerid': `Rulimena Dialer <${sipConfig.sip.username}>`,
        'timeout': sipConfig.dialer.callTimeout * 1000,
        'variable': {
          'CALL_ID': call.id,
          'AGENT_ID': agentId,
          'CAMPAIGN_ID': campaignId || '',
          'CONTACT_ID': contactId || ''
        }
      }, (err, res) => {
        if (err) {
          console.error('Error making call:', err);
          // Update call status to failed
          this.updateCallStatus(call.id, 'failed');
        } else {
          console.log('Call initiated:', res);
        }
      });
      
      // Create call log entry
      await CallLog.create({
        callId: call.id,
        eventType: 'initiated',
        agentId: agentId
      });
      
      return call;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }
  
  /**
   * End a call
   */
  async endCall(callId) {
    try {
      // Get call information
      const callInfo = this.calls.get(callId);
      if (!callInfo) {
        console.warn('Call not found:', callId);
        return;
      }
      
      // Update call status
      await this.updateCallStatus(callId, 'completed');
      
      // Calculate call duration
      const duration = Math.floor((new Date() - callInfo.startTime) / 1000);
      
      // Update call with duration
      await Call.updateDuration(callId, duration);
      
      // Remove from active calls
      this.calls.delete(callId);
      
      // Emit call ended event
      emitCallEnded({
        callId: callId,
        duration: duration,
        timestamp: new Date()
      });
      
      // Create call log entry
      await CallLog.create({
        callId: callId,
        eventType: 'ended',
        details: { duration: duration }
      });
      
      console.log(`Call ${callId} ended with duration ${duration} seconds`);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }
  
  /**
   * Update call status
   */
  async updateCallStatus(callId, status) {
    try {
      // Update database
      await Call.updateStatus(callId, status);
      
      // Update in-memory tracking
      const callInfo = this.calls.get(callId);
      if (callInfo) {
        callInfo.status = status;
      }
      
      // Emit appropriate events based on status
      if (status === 'connected') {
        emitCallConnected({
          callId: callId,
          timestamp: new Date()
        });
        
        // Create call log entry
        await CallLog.create({
          callId: callId,
          eventType: 'connected'
        });
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  }
  
  /**
   * Get active calls
   */
  getActiveCalls() {
    return Array.from(this.calls.values());
  }
  
  /**
   * Shutdown SIP service
   */
  async shutdown() {
    try {
      console.log('Shutting down SIP service...');
      
      // End all active calls
      for (const callId of this.calls.keys()) {
        await this.endCall(callId);
      }
      
      // Close SIP stack
      if (this.sipStack) {
        this.sipStack.destroy();
      }
      
      // Close AMI connection
      if (this.amiClient) {
        this.amiClient.disconnect();
      }
      
      this.isInitialized = false;
      console.log('SIP service shut down successfully');
    } catch (error) {
      console.error('Error shutting down SIP service:', error);
    }
  }
}

// Export singleton instance
module.exports = new SIPService();