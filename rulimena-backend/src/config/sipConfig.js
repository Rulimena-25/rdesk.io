const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// SIP Configuration
const sipConfig = {
  // Asterisk Manager Interface (AMI) settings
  ami: {
    host: process.env.ASTERISK_AMI_HOST || 'localhost',
    port: process.env.ASTERISK_AMI_PORT || 5038,
    username: process.env.ASTERISK_AMI_USERNAME || 'rulimena',
    password: process.env.ASTERISK_AMI_PASSWORD || 'rulimena_password'
  },
  
  // SIP account settings
  sip: {
    // SIP server settings
    server: process.env.SIP_SERVER || 'sip.rulimena.io',
    port: process.env.SIP_PORT || 5060,
    transport: process.env.SIP_TRANSPORT || 'udp',
    
    // SIP account credentials
    username: process.env.SIP_USERNAME || 'rulimena',
    password: process.env.SIP_PASSWORD || 'rulimena_sip_password',
    realm: process.env.SIP_REALM || 'rulimena.io',
    
    // Registration settings
    register: process.env.SIP_REGISTER === 'true' || true,
    registerExpires: process.env.SIP_REGISTER_EXPIRES || 3600,
    
    // Codec preferences
    codecs: process.env.SIP_CODECS ? process.env.SIP_CODECS.split(',') : ['PCMU', 'PCMA', 'G729'],
    
    // Network settings
    localAddress: process.env.SIP_LOCAL_ADDRESS || '0.0.0.0',
    publicAddress: process.env.SIP_PUBLIC_ADDRESS || '',
    
    // NAT settings
    nat: process.env.SIP_NAT === 'true' || false,
    firewall: process.env.SIP_FIREWALL === 'true' || false,
    
    // DTMF settings
    dtmfMode: process.env.SIP_DTMF_MODE || 'rfc2833',
    
    // Audio settings
    useSrtp: process.env.SIP_USE_SRTP === 'true' || false,
    rtpPortRange: process.env.SIP_RTP_PORT_RANGE || '10000-20000'
  },
  
  // Dialer settings
  dialer: {
    // Maximum concurrent calls per agent
    maxConcurrentCalls: process.env.DIALER_MAX_CONCURRENT_CALLS || 5,
    
    // Call timeout settings
    callTimeout: process.env.DIALER_CALL_TIMEOUT || 30,
    ringTimeout: process.env.DIALER_RING_TIMEOUT || 20,
    
    // Retry settings
    maxRetries: process.env.DIALER_MAX_RETRIES || 3,
    retryInterval: process.env.DIALER_RETRY_INTERVAL || 5,
    
    // Predictive dialing settings
    predictive: {
      maxRings: process.env.PREDICTIVE_MAX_RINGS || 10,
      ringDelay: process.env.PREDICTIVE_RING_DELAY || 2,
      maxConcurrent: process.env.PREDICTIVE_MAX_CONCURRENT || 5
    }
  }
};

module.exports = sipConfig;