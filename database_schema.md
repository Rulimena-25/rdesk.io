# rulimena.io Database Schema Design

## Overview
This document outlines the database schema for rulimena.io, a smart predictive dialer system. The schema is designed to support call center operations with predictive lead scoring, campaign management, and CRM integration.

## Database Technology
- **Primary Database**: MongoDB (NoSQL for flexibility)
- **Search Engine**: Elasticsearch (for advanced search capabilities)
- **Cache**: Redis (for session and frequently accessed data)

## Collections

### 1. Users
Stores information about system users (admins, supervisors, agents).

```javascript
{
  _id: ObjectId,
  username: String,           // Unique username
  email: String,              // User email
  password: String,           // Hashed password
  firstName: String,          // User's first name
  lastName: String,           // User's last name
  role: String,               // "admin", "supervisor", "agent"
  status: String,             // "active", "inactive", "suspended"
  phoneNumber: String,        // User's phone number
  department: String,         // Department assignment
  createdAt: Date,            // Account creation date
  updatedAt: Date,            // Last update timestamp
  lastLogin: Date             // Last login timestamp
}
```

### 2. Contacts
Stores contact information for potential customers.

```javascript
{
  _id: ObjectId,
  firstName: String,          // Contact's first name
  lastName: String,           // Contact's last name
  company: String,            // Company name
  email: String,              // Contact email
  phoneNumbers: [             // Multiple phone numbers
    {
      type: String,           // "home", "work", "mobile"
      number: String,         // Phone number
      primary: Boolean       // Primary contact number
    }
  ],
  address: {                  // Contact address
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  demographics: {            // Demographic information
    age: Number,
    gender: String,
    income: Number,
    occupation: String
  },
  tags: [String],             // Custom tags for categorization
  source: String,            // Data source (import, manual entry, CRM sync)
  score: Number,              // Predictive lead score (0-100)
  scoreFactors: [String],     // Factors contributing to score
  lastContacted: Date,        // Last contact attempt
  nextContact: Date,          // Scheduled next contact
  status: String,             // "new", "contacted", "interested", "not interested", "converted"
  customFields: Object,       // Custom fields from CRM integration
  createdAt: Date,            // Record creation date
  updatedAt: Date,            // Last update timestamp
  createdBy: ObjectId,        // User who created the contact
  campaignIds: [ObjectId]     // Campaigns this contact is part of
}
```

### 3. Campaigns
Stores information about dialing campaigns.

```javascript
{
  _id: ObjectId,
  name: String,               // Campaign name
  description: String,        // Campaign description
  status: String,             // "draft", "scheduled", "active", "paused", "completed"
  type: String,               // "manual", "turbo", "predictive"
  startDate: Date,            // Campaign start date
  endDate: Date,              // Campaign end date
  dialRatio: Number,          // Dial ratio for predictive dialing
  maxConcurrentCalls: Number, // Maximum concurrent calls
  contactFilter: Object,      // Filter criteria for selecting contacts
  script: String,             // Call script template
  customFields: Object,       // Custom fields for campaign
  createdBy: ObjectId,        // User who created the campaign
  assignedAgents: [ObjectId],  // Agents assigned to this campaign
  contactCount: Number,       // Total number of contacts in campaign
  contactedCount: Number,      // Number of contacts contacted
  conversionCount: Number,     // Number of conversions
  createdAt: Date,            // Campaign creation date
  updatedAt: Date,            // Last update timestamp
  settings: {                 // Campaign-specific settings
    callRecording: Boolean,    // Enable call recording
    voicemailDetection: Boolean, // Enable voicemail detection
    timezoneHandling: String   // "local", "system", "custom"
  }
}
```

### 4. Calls
Stores information about individual calls.

```javascript
{
  _id: ObjectId,
  campaignId: ObjectId,        // Associated campaign
  contactId: ObjectId,          // Associated contact
  agentId: ObjectId,            // Agent who handled the call
  phoneNumber: String,         // Dialed phone number
  status: String,              // "initiated", "ringing", "connected", "completed", "failed", "busy", "no-answer"
  direction: String,            // "outbound", "inbound"
  startTime: Date,             // Call start time
  endTime: Date,               // Call end time
  duration: Number,            // Call duration in seconds
  recordingUrl: String,        // URL to call recording
  voicemail: Boolean,          // Whether voicemail was detected
  disposition: String,         // Call outcome ("sale", "appointment", "not interested", etc.)
  notes: String,               // Agent notes about the call
  customFields: Object,        // Custom fields from CRM
  predictiveScore: Number,      // Score at time of call
  systemData: Object,          // System-level data (dial attempts, etc.)
  createdAt: Date,             // Record creation date
  updatedAt: Date              // Last update timestamp
}
```

### 5. CallLogs
Stores detailed logs of call events for analytics.

```javascript
{
  _id: ObjectId,
  callId: ObjectId,            // Associated call
  eventType: String,           // "dial", "ring", "connect", "disconnect", "transfer"
  timestamp: Date,             // Event timestamp
  agentId: ObjectId,           // Agent involved in event
  details: Object,             // Event-specific details
  createdAt: Date              // Record creation date
}
```

### 6. PredictiveModels
Stores information about predictive models used for lead scoring.

```javascript
{
  _id: ObjectId,
  name: String,                // Model name
  description: String,         // Model description
  version: String,             // Model version
  algorithm: String,            // Algorithm used ("random-forest", "neural-network", etc.)
  accuracy: Number,            // Model accuracy score
  features: [String],          // Features used in the model
  isActive: Boolean,           // Whether this is the active model
  trainingData: Object,        // Information about training data
  createdAt: Date,             // Model creation date
  updatedAt: Date              // Last update timestamp
}
```

### 7. Dispositions
Stores predefined call dispositions for consistent data entry.

```javascript
{
  _id: ObjectId,
  name: String,                // Disposition name
  category: String,           // "positive", "negative", "neutral", "system"
  description: String,         // Description of disposition
  followUpRequired: Boolean,   // Whether follow-up is required
  followUpDelay: Number,       // Hours before follow-up
  createdAt: Date,             // Record creation date
  createdBy: ObjectId         // User who created the disposition
}
```

### 8. SystemSettings
Stores system-wide configuration settings.

```javascript
{
  _id: ObjectId,
  key: String,                 // Setting key
  value: Object,               // Setting value
  description: String,         // Description of the setting
  category: String,            // Setting category
  updatedAt: Date,             // Last update timestamp
  updatedBy: ObjectId         // User who last updated
}
```

## Indexes

### Users Collection
- username (unique)
- email (unique)
- role

### Contacts Collection
- email (unique)
- phoneNumbers.number
- score
- status
- campaignIds
- createdAt

### Campaigns Collection
- name
- status
- startDate, endDate
- createdBy

### Calls Collection
- campaignId
- contactId
- agentId
- status
- startTime, endTime
- createdAt

### PredictiveModels Collection
- isActive
- createdAt

## Relationships

1. **Users** ↔ **Campaigns**: Users create and manage campaigns
2. **Campaigns** ↔ **Contacts**: Contacts are assigned to campaigns
3. **Contacts** ↔ **Calls**: Contacts have multiple calls
4. **Users** ↔ **Calls**: Agents handle calls
5. **Calls** ↔ **CallLogs**: Calls have multiple log entries
6. **Contacts** ↔ **PredictiveModels**: Contacts are scored by models

## Data Flow

1. Contacts are imported or synced from CRM systems
2. Campaigns are created with specific criteria
3. Contacts are assigned to campaigns
4. Calls are initiated through dialer modes
5. Call data is recorded and stored
6. Predictive models analyze call data to score contacts
7. Analytics are generated from call logs and contact data
8. Reports are created for performance tracking

## Scalability Considerations

- **Sharding**: Contacts collection can be sharded by campaignId or creation date
- **Archiving**: Old call logs can be archived to separate collections
- **Caching**: Frequently accessed data (active campaigns, agent status) cached in Redis
- **Read Replicas**: Separate read replicas for analytics queries