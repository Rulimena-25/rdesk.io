import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import websocketService from '../services/websocket';
import './Dialer.css';

const Dialer = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [notes, setNotes] = useState('');
  const [disposition, setDisposition] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Real-time contact data
  const [currentContact, setCurrentContact] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumbers: [
      { type: 'mobile', number: '+1234567890', primary: true },
      { type: 'work', number: '+0987654321', primary: false }
    ],
    company: 'ABC Corporation',
    position: 'Marketing Manager',
    demographics: {
      age: 35,
      location: 'New York, NY',
      income: '$75,000',
      leadScore: 85
    },
    callHistory: [
      { date: '2023-05-15', outcome: 'Interested', notes: 'Requested product demo' },
      { date: '2023-04-22', outcome: 'No Answer', notes: 'Left voicemail' }
    ]
  });
  
  // Real-time queue data for turbo dialer
  const [queue, setQueue] = useState([]);
  
  const [queueStats, setQueueStats] = useState({
    inQueue: 0,
    completed: 0,
    successRate: 0,
    avgHandleTime: '0:00'
  });
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    callsPerHour: 0,
    connectionRate: 0,
    conversionRate: 0,
    avgHandleTime: '0:00'
  });
  
  // Agent status
  const [agentStatus, setAgentStatus] = useState({
    currentStatus: 'available',
    nextBreak: '',
    performanceRating: '0.0/5.0'
  });
  
  // Initialize WebSocket listeners
  useEffect(() => {
    // Join dialer room
    websocketService.joinRoom('dialer-room');
    
    // Listen for queue updates
    const handleQueueUpdate = (data) => {
      if (data.queue) {
        setQueue(data.queue);
      }
      if (data.queueStats) {
        setQueueStats(data.queueStats);
      }
    };
    
    // Listen for performance metrics updates
    const handlePerformanceUpdate = (data) => {
      if (data.metrics) {
        setPerformanceMetrics(data.metrics);
      }
    };
    
    // Listen for agent status updates
    const handleAgentStatusUpdate = (data) => {
      if (data.status) {
        setAgentStatus(data.status);
      }
    };
    
    // Listen for call events
    const handleCallConnected = (data) => {
      setCallStatus('connected');
      setCallDuration(0);
      // Send agent status update
      websocketService.sendAgentStatusUpdate({ status: 'on-call' });
    };
    
    const handleCallEnded = (data) => {
      setCallStatus('ended');
      setTimeout(() => {
        setCallStatus('idle');
        setIsMuted(false);
        setIsOnHold(false);
        // Send agent status update
        websocketService.sendAgentStatusUpdate({ status: 'available' });
      }, 2000);
    };
    
    // Add event listeners
    websocketService.on('queue-update', handleQueueUpdate);
    websocketService.on('performance-update', handlePerformanceUpdate);
    websocketService.on('agent-status-update', handleAgentStatusUpdate);
    websocketService.on('call-connected', handleCallConnected);
    websocketService.on('call-ended', handleCallEnded);
    
    // Request initial data
    websocketService.send('request-dialer-data');
    
    // Clean up event listeners
    return () => {
      websocketService.off('queue-update', handleQueueUpdate);
      websocketService.off('performance-update', handlePerformanceUpdate);
      websocketService.off('agent-status-update', handleAgentStatusUpdate);
      websocketService.off('call-connected', handleCallConnected);
      websocketService.off('call-ended', handleCallEnded);
      websocketService.leaveRoom('dialer-room');
    };
  }, []);
  
  // Timer for call duration
  useEffect(() => {
    let timer;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleDial = () => {
    if (phoneNumber) {
      setCallStatus('calling');
      // Send dial request to backend
      websocketService.send('dial-request', { phoneNumber });
    }
  };
  
  const handleHangup = () => {
    setCallStatus('ended');
    // Send hangup request to backend
    websocketService.send('hangup-request');
    setTimeout(() => {
      setCallStatus('idle');
      setIsMuted(false);
      setIsOnHold(false);
    }, 2000);
  };
  
  const handleMute = () => {
    setIsMuted(!isMuted);
    // Send mute status to backend
    websocketService.send('mute-toggle', { isMuted: !isMuted });
  };
  
  const handleHold = () => {
    setIsOnHold(!isOnHold);
    // Send hold status to backend
    websocketService.send('hold-toggle', { isOnHold: !isOnHold });
  };
  
  const handleSaveNotes = () => {
    // Send notes to backend
    websocketService.send('save-notes', { notes });
    alert('Notes saved successfully!');
  };
  
  const handleSaveDisposition = () => {
    // Send disposition to backend
    websocketService.send('save-disposition', { disposition });
    alert('Disposition saved successfully!');
  };
  
  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    // Send recording status to backend
    websocketService.send('recording-toggle', { isRecording: !isRecording });
  };
  
  const handleTransfer = () => {
    // Send transfer request to backend
    websocketService.send('transfer-request');
    alert('Transfer initiated!');
  };
  
  const handleConference = () => {
    // Send conference request to backend
    websocketService.send('conference-request');
    alert('Conference call initiated!');
  };
  
  const handleStartCampaign = () => {
    // Send campaign start request to backend
    websocketService.send('start-campaign');
    alert('Campaign started!');
  };
  
  const handlePauseCampaign = () => {
    // Send campaign pause request to backend
    websocketService.send('pause-campaign');
    alert('Campaign paused!');
  };
  
  const handleStopCampaign = () => {
    // Send campaign stop request to backend
    websocketService.send('stop-campaign');
    alert('Campaign stopped!');
  };
  
  const handleAcceptCall = (contactId) => {
    // Send accept call request to backend
    websocketService.send('accept-call', { contactId });
    
    // Find the contact in the queue
    const contact = queue.find(c => c.id === contactId);
    if (contact) {
      setPhoneNumber(contact.phone);
      handleDial();
    }
  };
  
  const handleRejectCall = (contactId) => {
    // Send reject call request to backend
    websocketService.send('reject-call', { contactId });
  };
  
  const handleQuickDisposition = (contactId, outcome) => {
    // Send quick disposition to backend
    websocketService.send('quick-disposition', { contactId, outcome });
  };
  
  return (
    <div className="dialer-container">
      <header className="dialer-header">
        <h1>Dialer Interface</h1>
        <div className="dialer-tabs">
          <button
            className={activeTab === 'manual' ? 'active' : ''}
            onClick={() => setActiveTab('manual')}
          >
            Manual Dialer
          </button>
          <button
            className={activeTab === 'turbo' ? 'active' : ''}
            onClick={() => setActiveTab('turbo')}
          >
            Turbo Dialer
          </button>
        </div>
      </header>
      
      <div className="dialer-content">
        {activeTab === 'manual' ? (
          <div className="manual-dialer">
            <div className="contact-panel">
              <h2>Contact Information</h2>
              <div className="contact-details">
                <div className="contact-field">
                  <label>Name:</label>
                  <span>{currentContact.firstName} {currentContact.lastName}</span>
                </div>
                <div className="contact-field">
                  <label>Email:</label>
                  <span>{currentContact.email}</span>
                </div>
                <div className="contact-field">
                  <label>Phone Numbers:</label>
                  <div className="phone-numbers-list">
                    {currentContact.phoneNumbers.map((phone, index) => (
                      <div key={index} className="phone-number-item">
                        <span className="phone-type">{phone.type}:</span>
                        <span className="phone-number">{phone.number}</span>
                        <button
                          className="click-to-dial"
                          onClick={() => setPhoneNumber(phone.number)}
                        >
                          Dial
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="contact-field">
                  <label>Company:</label>
                  <span>{currentContact.company}</span>
                </div>
                <div className="contact-field">
                  <label>Position:</label>
                  <span>{currentContact.position}</span>
                </div>
                <div className="contact-field">
                  <label>Demographics:</label>
                  <div className="demographics-info">
                    <span>Age: {currentContact.demographics.age}</span>
                    <span>Location: {currentContact.demographics.location}</span>
                    <span>Income: {currentContact.demographics.income}</span>
                    <span>Lead Score: {currentContact.demographics.leadScore}</span>
                  </div>
                </div>
                <div className="contact-field">
                  <label>Call History:</label>
                  <div className="call-history">
                    {currentContact.callHistory.map((call, index) => (
                      <div key={index} className="call-history-item">
                        <span className="call-date">{call.date}</span>
                        <span className="call-outcome">{call.outcome}</span>
                        <span className="call-notes">{call.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="dialer-panel">
              <div className="phone-display">
                <div className="phone-number">{phoneNumber || 'Enter phone number'}</div>
                {callStatus !== 'idle' && (
                  <div className="call-status">
                    <div className={`status-indicator ${callStatus}`}></div>
                    <span className="status-text">
                      {callStatus === 'calling' && 'Calling...'}
                      {callStatus === 'connected' && `Connected (${formatTime(callDuration)})`}
                      {callStatus === 'ended' && 'Call Ended'}
                    </span>
                  </div>
                )}
                {callStatus === 'connected' && (
                  <div className="call-indicators">
                    {isMuted && <span className="indicator muted">MUTED</span>}
                    {isOnHold && <span className="indicator hold">ON HOLD</span>}
                    {isRecording && <span className="indicator recording">RECORDING</span>}
                  </div>
                )}
              </div>
              
              <div className="dialpad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                  <button
                    key={key}
                    className="dialpad-key"
                    onClick={() => setPhoneNumber(prev => prev + key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              
              <div className="call-controls">
                {callStatus === 'idle' || callStatus === 'ended' ? (
                  <button
                    className="dial-button"
                    onClick={handleDial}
                    disabled={!phoneNumber}
                  >
                    Dial
                  </button>
                ) : (
                  <>
                    <button
                      className={`control-button ${isMuted ? 'active' : ''}`}
                      onClick={handleMute}
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      className={`control-button ${isOnHold ? 'active' : ''}`}
                      onClick={handleHold}
                    >
                      {isOnHold ? 'Resume' : 'Hold'}
                    </button>
                    <button
                      className="hangup-button"
                      onClick={handleHangup}
                    >
                      Hang Up
                    </button>
                    <button
                      className={`control-button ${isRecording ? 'active' : ''}`}
                      onClick={handleStartRecording}
                    >
                      {isRecording ? 'Stop Rec' : 'Record'}
                    </button>
                    <button
                      className="control-button"
                      onClick={handleTransfer}
                    >
                      Transfer
                    </button>
                    <button
                      className="control-button"
                      onClick={handleConference}
                    >
                      Conference
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="script-panel">
              <h2>Call Script</h2>
              <div className="script-content">
                <p>Hello {currentContact.firstName}, this is [Your Name] from rulimena.io. I'm calling to discuss...</p>
                <p>How can I help you today?</p>
                <div className="compliance-reminder">
                  <strong>Compliance Reminder:</strong> Remember to mention our privacy policy and obtain consent for recording.
                </div>
              </div>
            </div>
            
            <div className="notes-panel">
              <h2>Call Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter call notes here..."
                rows="4"
              />
              <div className="disposition-section">
                <label htmlFor="disposition">Call Disposition:</label>
                <select
                  id="disposition"
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                >
                  <option value="">Select disposition</option>
                  <option value="interested">Interested</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="no-answer">No Answer</option>
                  <option value="voicemail">Left Voicemail</option>
                  <option value="callback">Callback Requested</option>
                  <option value="do-not-call">Do Not Call</option>
                </select>
              </div>
              <div className="notes-actions">
                <button className="save-notes-button" onClick={handleSaveNotes}>
                  Save Notes
                </button>
                <button className="save-disposition-button" onClick={handleSaveDisposition}>
                  Save Disposition
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="turbo-dialer">
            <div className="queue-panel">
              <h2>Call Queue</h2>
              <div className="queue-stats">
                <div className="stat">
                  <span className="stat-label">In Queue:</span>
                  <span className="stat-value">{queueStats.inQueue}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Completed:</span>
                  <span className="stat-value">{queueStats.completed}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">{queueStats.successRate}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Handle Time:</span>
                  <span className="stat-value">{queueStats.avgHandleTime}</span>
                </div>
              </div>
              
              <div className="queue-list">
                {queue.map((contact) => (
                  <div key={contact.id} className="queue-item">
                    <div className="queue-contact-info">
                      <div className="queue-contact-name">{contact.name}</div>
                      <div className="queue-contact-phone">{contact.phone}</div>
                    </div>
                    <div className="queue-item-details">
                      <span className={`queue-status ${contact.status.toLowerCase()}`}>
                        {contact.status}
                      </span>
                      <span className={`queue-priority ${contact.priority.toLowerCase()}`}>
                        {contact.priority}
                      </span>
                    </div>
                    {contact.status === 'Ready' && (
                      <div className="queue-actions">
                        <button
                          className="accept-button"
                          onClick={() => handleAcceptCall(contact.id)}
                        >
                          Accept
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleRejectCall(contact.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {contact.status === 'Calling' && (
                      <div className="quick-disposition">
                        <button
                          className="disposition-button"
                          onClick={() => handleQuickDisposition(contact.id, 'Interested')}
                        >
                          Interested
                        </button>
                        <button
                          className="disposition-button"
                          onClick={() => handleQuickDisposition(contact.id, 'Not Interested')}
                        >
                          Not Interested
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="turbo-controls">
              <button className="start-campaign-button" onClick={handleStartCampaign}>
                Start Campaign
              </button>
              <button className="pause-campaign-button" onClick={handlePauseCampaign}>
                Pause Campaign
              </button>
              <button className="stop-campaign-button" onClick={handleStopCampaign}>
                Stop Campaign
              </button>
            </div>
            
            <div className="performance-dashboard">
              <h2>Performance Dashboard</h2>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Calls per Hour</span>
                  <span className="metric-value">{performanceMetrics.callsPerHour}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Connection Rate</span>
                  <span className="metric-value">{performanceMetrics.connectionRate}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Conversion Rate</span>
                  <span className="metric-value">{performanceMetrics.conversionRate}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Avg Handle Time</span>
                  <span className="metric-value">{performanceMetrics.avgHandleTime}</span>
                </div>
              </div>
            </div>
            
            <div className="agent-status-panel">
              <h2>Agent Status</h2>
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Current Status:</span>
                  <span className={`status-value ${agentStatus.currentStatus.toLowerCase()}`}>
                    {agentStatus.currentStatus}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Next Break:</span>
                  <span className="status-value">{agentStatus.nextBreak}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Performance Rating:</span>
                  <span className="status-value">{agentStatus.performanceRating}</span>
                </div>
              </div>
              <div className="status-controls">
                <button className="status-button" onClick={() => websocketService.send('agent-status-change', { status: 'break' })}>
                  Break
                </button>
                <button className="status-button" onClick={() => websocketService.send('agent-status-change', { status: 'lunch' })}>
                  Lunch
                </button>
                <button className="status-button" onClick={() => websocketService.send('agent-status-change', { status: 'training' })}>
                  Training
                </button>
                <button className="status-button" onClick={() => websocketService.send('agent-status-change', { status: 'help' })}>
                  Help
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialer;