# API Reference Documentation

## Overview
This document provides a comprehensive reference for all API endpoints used by the Donation Dashboard frontend application. The API follows RESTful principles and uses JSON for request/response bodies.

## Base Configuration

### Base URL
```
Development: http://localhost:3002
Production: Set via REACT_APP_API_BASE_URL environment variable
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Content Types
- **JSON requests**: `Content-Type: application/json`
- **File uploads**: `Content-Type: multipart/form-data`

## Authentication Endpoints

### User Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid credentials
- `500` - Server error

#### Register
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/users/me
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Business Authentication

#### Business Login
```http
POST /api/business/auth/login
```

**Request Body:**
```json
{
  "contactEmail": "business@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "businessId": "business_123456"
}
```

#### Business Signup
```http
POST /api/business/auth/signup
```

**Request Body:**
```json
{
  "companyName": "Tech Corp",
  "contactEmail": "business@example.com",
  "password": "password123",
  "description": "Technology company focused on social impact",
  "preferredCauses": ["education", "environment"]
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "businessId": "business_123456"
}
```

#### Get Business Profile
```http
GET /api/business/me
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "businessId": "business_123456",
  "companyName": "Tech Corp",
  "contactEmail": "business@example.com",
  "description": "Technology company focused on social impact",
  "preferredCauses": ["education", "environment"]
}
```

### Charity Authentication

#### Charity Login
```http
POST /api/charities/login
```

**Request Body:**
```json
{
  "contactEmail": "charity@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "charity": {
    "_id": "507f1f77bcf86cd799439013",
    "charityName": "Help Foundation"
  }
}
```

#### Charity Signup
```http
POST /api/charities/signup
```

**Request Body:**
```json
{
  "charityName": "Help Foundation",
  "contactEmail": "charity@example.com",
  "password": "password123",
  "description": "Helping communities in need",
  "missionStatement": "Our mission is to provide aid to underserved communities",
  "taxId": "12-3456789",
  "category": "humanitarian"
}
```

#### Get Charity Profile
```http
GET /api/charities/me
```

**Headers:**
- `Authorization: Bearer <token>`

### OAuth Endpoints

#### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent page

#### Google OAuth Callback
Frontend route: `/auth/google/callback?token=<jwt_token>`

#### Microsoft OAuth
```http
GET /api/auth/microsoft
```
Redirects to Microsoft OAuth consent page

#### Microsoft OAuth Callback
Frontend route: `/auth/microsoft/callback?token=<jwt_token>`

## Donation Management

### Get User Donations
```http
GET /api/donations
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "charity": "Red Cross",
    "charityType": "humanitarian",
    "amount": 50.00,
    "date": "2024-01-15",
    "isMonthly": false,
    "receiptUrl": "/uploads/receipts/receipt_123.pdf",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Donation
```http
POST /api/donations
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `charity` (string, required)
- `charityType` (string, required)
- `amount` (number, required)
- `date` (string, required, YYYY-MM-DD)
- `isMonthly` (boolean, optional)
- `receipt` (file, optional)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "charity": "Red Cross",
  "charityType": "humanitarian",
  "amount": 50.00,
  "date": "2024-01-15",
  "isMonthly": false,
  "receiptUrl": "/uploads/receipts/receipt_123.pdf",
  "status": "completed"
}
```

### Update Donation
```http
PUT /api/donations/:id
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**URL Parameters:**
- `id` - Donation ID

**Form Data:**
Same as Create Donation

### Delete Donation
```http
DELETE /api/donations/:id
```

**Headers:**
- `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Donation ID

**Response:**
```json
{
  "message": "Donation deleted successfully"
}
```

## Charity Management

### Search Charities
```http
GET /api/search-charities?q=<search_query>
```

**Query Parameters:**
- `q` - Search query string

**Response:**
```json
{
  "result": {
    "records": [
      {
        "ABN": "12345678901",
        "Charity_Legal_Name": "Red Cross Australia",
        "Town_City": "Melbourne",
        "State": "VIC",
        "Postcode": "3000"
      }
    ]
  }
}
```

### Get All Charities
```http
GET /api/charities
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "charityName": "Help Foundation",
    "description": "Helping communities in need",
    "category": "humanitarian",
    "linkedABN": "12345678901"
  }
]
```

### Get Charity Link Requests (Admin)
```http
GET /api/charity/admin/link-requests
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "charityId": "507f1f77bcf86cd799439013",
    "charityABN": "12345678901",
    "evidenceFile": "/uploads/evidence/evidence_123.pdf",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Approve Charity Link Request
```http
POST /api/charity/admin/link-requests/:id/approve
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**URL Parameters:**
- `id` - Link request ID

### Reject Charity Link Request
```http
POST /api/charity/admin/link-requests/:id/reject
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**URL Parameters:**
- `id` - Link request ID

## Payment Processing

### Braintree Integration

#### Get Client Token
```http
GET /api/braintree/client_token
```

**Response:**
```json
{
  "clientToken": "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiI..."
}
```

#### Process Payment
```http
POST /api/braintree/checkout
```

**Request Body:**
```json
{
  "paymentMethodNonce": "tokencc_bf_xyz...",
  "amount": "50.00",
  "charityId": "charity_123"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "transaction_123",
    "status": "submitted_for_settlement",
    "amount": "50.00"
  }
}
```

### PayPal Integration

#### Capture Order
```http
POST /api/paypal/capture-order
```

**Request Body:**
```json
{
  "orderId": "ORDER-123456789",
  "charityId": "charity_123"
}
```

**Response:**
```json
{
  "success": true,
  "captureId": "CAPTURE-123456789"
}
```

## Business Features

### Get Business Campaigns
```http
GET /api/business/campaigns
```

**Headers:**
- `Authorization: Bearer <token>` (Business account required)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "businessId": "business_123",
    "name": "Holiday Giving Campaign",
    "description": "Match employee donations during the holiday season",
    "goal": 10000,
    "currentAmount": 5500,
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "targetAudience": "employee",
    "status": "active"
  }
]
```

### Create Business Campaign
```http
POST /api/business/campaigns
```

**Headers:**
- `Authorization: Bearer <token>` (Business account required)

**Request Body:**
```json
{
  "name": "Holiday Giving Campaign",
  "description": "Match employee donations during the holiday season",
  "goal": 10000,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "targetAudience": "employee"
}
```

## User Management (Admin)

### Get All Users
```http
GET /api/admin/users
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Update User Role
```http
PUT /api/admin/users/:userId/role
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**URL Parameters:**
- `userId` - User ID

**Request Body:**
```json
{
  "role": "admin"
}
```

### Update User Status
```http
PUT /api/admin/users/:userId/status
```

**Headers:**
- `Authorization: Bearer <token>` (Admin required)

**URL Parameters:**
- `userId` - User ID

**Request Body:**
```json
{
  "status": "suspended"
}
```

## Impact and Analytics

### Get Matching Opportunities
```http
GET /api/matchingOpportunities
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "businessId": "business_123",
    "businessName": "Tech Corp",
    "message": "We'll match your donation 2:1!",
    "charity": "Red Cross",
    "cause": "humanitarian",
    "contribution": 1000,
    "donationAmount": 500,
    "multiplier": 2,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "accepted": false
  }
]
```

## Third-Party Integrations

### GlobalGiving Projects
```http
GET /api/globalgiving/projects/recommended
```

**Headers:**
- `Authorization: Bearer <token>` (optional)

**Query Parameters:**
- `searchQuery` - Personalized search query (optional)

**Response:**
```json
[
  {
    "id": 12345,
    "title": "Clean Water for Villages",
    "summary": "Providing clean water access to rural communities",
    "organization": {
      "name": "Water Aid International"
    },
    "goal": 50000,
    "funding": 35000,
    "imageLink": "https://example.com/project-image.jpg"
  }
]
```

## Error Responses

### Standard Error Format
```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `400` - Bad request (validation errors)
- `500` - Internal server error

### Validation Error Example
```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

## Rate Limiting

API endpoints may have rate limits applied:
- **Authentication endpoints**: 5 requests per minute
- **Payment endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Some endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (e.g., "-createdAt" for descending)

**Response Headers:**
```
X-Total-Count: 250
X-Page-Count: 13
```

## WebSocket Events (Future)

Planned WebSocket support for real-time features:
- Campaign updates
- Donation notifications
- Live impact tracking
- Admin alerts

## SDK Examples

### Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Client Class
```javascript
class DonationAPI {
  constructor(baseURL) {
    this.client = axios.create({ baseURL });
  }
  
  // Authentication
  async login(email, password) {
    const response = await this.client.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  }
  
  // Donations
  async getDonations(token) {
    const response = await this.client.get('/api/donations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
  
  async createDonation(token, formData) {
    const response = await this.client.post('/api/donations', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}

export default new DonationAPI(process.env.REACT_APP_API_BASE_URL);
```