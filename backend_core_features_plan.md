# Backend Core Features Implementation Plan

## Overview
This document outlines the implementation plan for the backend core features of rulimena.io, including contact management, campaign management, WebSocket integration for real-time call tracking, and predictive dialing algorithms.

## Technology Stack
- **Node.js**: JavaScript runtime for building scalable network applications
- **Express.js**: Web application framework for RESTful APIs
- **Socket.IO**: Real-time bidirectional event-based communication
- **MongoDB**: NoSQL database for flexible document storage
- **Redis**: In-memory data structure store for session management and caching
- **Python**: For machine learning algorithms (predictive dialing)

## Implementation Steps

### 1. Contact Management API
- Create RESTful endpoints for contact management:
  - GET `/api/contacts`: Retrieve contacts with filtering and pagination
  - POST `/api/contacts`: Create new contacts
  - GET `/api/contacts/:id`: Retrieve specific contact
  - PUT `/api/contacts/:id`: Update specific contact
  - DELETE `/api/contacts/:id`: Delete specific contact
- Implement contact import functionality:
  - CSV/XLSX file upload endpoint
  - Data validation and cleaning
  - Duplicate detection and handling
- Implement contact filtering and segmentation:
  - Pre-defined filters (demographic, behavioral, status, score-based)
  - Custom filter creation and saving
  - Rule-based segment creation

### 2. Campaign Management API
- Create RESTful endpoints for campaign management:
  - GET `/api/campaigns`: Retrieve campaigns with filtering and pagination
  - POST `/api/campaigns`: Create new campaigns
  - GET `/api/campaigns/:id`: Retrieve specific campaign
  - PUT `/api/campaigns/:id`: Update specific campaign
  - DELETE `/api/campaigns/:id`: Delete specific campaign
- Implement campaign lifecycle management:
  - Draft, Scheduled, Active, Paused, Completed states
  - Start/stop control functionality
  - Real-time adjustment capabilities
- Implement campaign scheduling:
  - Working hours configuration
  - Timezone-based scheduling
  - Retry logic implementation

### 3. WebSocket Integration for Real-time Call Tracking
- Implement Socket.IO server with Redis adapter for scaling
- Create event handling system for:
  - Agent events (status updates, call started/ended, performance updates)
  - Call events (queued, ringing, connected, disconnected, status changed)
  - Campaign events (started, paused, completed, stats update)
  - Dashboard events (live stats, agent activity, call volume, performance metrics)
- Implement room management:
  - Agent rooms, campaign rooms, supervisor rooms, dashboard rooms, admin rooms
  - Dynamic room creation and cleanup
  - Room membership validation
- Implement security measures:
  - JWT token validation for connection establishment
  - Role-based access control for event subscriptions
  - TLS encryption for all WebSocket connections

### 4. Predictive Dialing Algorithm
- Implement machine learning-based predictive dialing as specified in predictive_scoring_algorithm.md
- Create Python service for:
  - Gradient Boosted Decision Trees implementation
  - Feature engineering pipeline
  - Model training and evaluation framework
  - Real-time scoring API
- Implement dialing optimization:
  - Predictive algorithms to determine optimal dialing times
  - Dynamic adjustment based on real-time conditions
  - Call prioritization based on lead scores
  - Intelligent call routing

## API Endpoints Specification

### Contact Management Endpoints

#### GET /api/contacts
Retrieve contacts with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of contacts per page (default: 10)
- `filter`: Filter criteria (JSON object)
- `sort`: Sort field and direction (e.g., "name:asc")

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "string",
        "firstName": "string",
        "lastName": "string",
        "company": "string",
        "email": "string",
        "phoneNumbers": [
          {
            "type": "string",
            "number": "string",
            "primary": "boolean"
          }
        ],
        "score": "number",
        "status": "string",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalContacts": "number"
    }
  }
}
```

#### POST /api/contacts
Create new contacts.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "company": "string",
  "email": "string",
  "phoneNumbers": [
    {
      "type": "string",
      "number": "string",
      "primary": "boolean"
    }
  ],
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "demographics": {
    "age": "number",
    "gender": "string",
    "income": "number",
    "occupation": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "company": "string",
    "email": "string",
    "phoneNumbers": [
      {
        "type": "string",
        "number": "string",
        "primary": "boolean"
      }
    ],
    "score": "number",
    "status": "string",
    "createdAt": "date"
  }
}
```

### Campaign Management Endpoints

#### GET /api/campaigns
Retrieve campaigns with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of campaigns per page (default: 10)
- `filter`: Filter criteria (JSON object)
- `sort`: Sort field and direction (e.g., "name:asc")

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
       