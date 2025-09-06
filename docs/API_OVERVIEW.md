# Zypco API Documentation Overview

## 🚀 Modern API Architecture - Complete Implementation

This documentation covers the fully modernized Zypco International Courier API system, built with Next.js 15 and advanced security features. The API provides comprehensive courier and logistics services with enterprise-grade security, monitoring, and performance optimization.

---

## 📁 Documentation Structure

### Core API Modules
1. **[Authentication API](auth.md)** - Complete user authentication system
   - JWT-based authentication with refresh tokens
   - Multi-factor authentication support
   - Role-based access control (RBAC)
   - Advanced security features (rate limiting, login history, account lockout)

2. **[Order Management API](orders.md)** - Full order lifecycle management
   - Order creation with advanced validation
   - Real-time order tracking and updates
   - Payment integration and processing
   - Order cancellation and refund handling

3. **[Tracking API](tracking.md)** - Comprehensive shipment tracking
   - Real-time package tracking with detailed history
   - Multi-carrier support (DHL, FedEx, UPS, Aramex)
   - Delivery estimation and route optimization
   - Public tracking interface for customers

4. **[User Accounts API](user-accounts.md)** - Profile and account management
   - User profile management with preferences
   - Address book management
   - Account settings and customization
   - Privacy controls and data management

5. **[Notifications API](notifications.md)** - Multi-channel notification system
   - Real-time notifications (email, SMS, push)
   - Notification preferences and settings
   - Delivery confirmations and alerts
   - Marketing and promotional communications

6. **[Contact System API](contact.md)** - Customer support and communication
   - Contact form submissions and ticketing
   - Support ticket management
   - Live chat integration
   - Customer feedback and satisfaction tracking

7. **[Countries & Addresses API](countries.md)** - Global shipping support
   - Comprehensive country and region data
   - Shipping service availability matrix
   - Address validation and formatting
   - Customs and regulatory information

---

## 🏗️ Technical Architecture

### Modern API Design Patterns
- **RESTful API Structure**: Clean, predictable URLs with proper HTTP methods
- **Service-Oriented Architecture**: Modular services for email, SMS, and notifications
- **Middleware-First Approach**: Authentication, validation, and rate limiting
- **Error Handling**: Comprehensive error responses with detailed debugging
- **Request/Response Validation**: Zod-based validation for all endpoints

### Security Implementation
- **JWT Authentication**: Access and refresh token system
- **Rate Limiting**: Configurable limits per endpoint and user
- **Request Validation**: Input sanitization and validation
- **Access Logging**: Comprehensive audit trails
- **CORS Configuration**: Secure cross-origin resource sharing

### Advanced Features
- **Real-time Notifications**: Multi-channel notification system
- **File Upload Handling**: Secure file processing with validation
- **Pagination System**: Efficient data retrieval with metadata
- **Search and Filtering**: Advanced query capabilities
- **Caching Strategy**: Optimized performance with intelligent caching

---

## 🔧 API Configuration

### Base URLs
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Authentication
All protected endpoints require authentication via Bearer token:
```http
Authorization: Bearer <your-jwt-token>
```

### Content Types
- **Request**: `application/json` or `multipart/form-data` (for file uploads)
- **Response**: `application/json`

---

## 📊 API Response Format

### Success Response Structure
```json
{
  "status": "200",
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1642248600_abc123",
  "data": {
    // Response data here
  },
  "pagination": {  // For paginated responses
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response Structure
```json
{
  "status": "400",
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1642248600_def456",
  "error": {
    "field": "email",
    "message": "Email format is invalid",
    "code": "VALIDATION_ERROR"
  },
  "details": {
    // Additional error context
  }
}
```

---

## 🔒 Security & Access Control

### User Roles and Permissions
- **user**: Standard customer with basic access
- **moderator**: Enhanced access for customer service
- **admin**: Administrative access to most features
- **super_admin**: Full system access and configuration

### Rate Limiting
Different rate limits apply based on endpoint type and user role:

| Endpoint Type | User | Admin | Public |
|---------------|------|-------|--------|
| Authentication | 10/min | 20/min | 5/min |
| Order Creation | 5/min | 10/min | N/A |
| Tracking | 30/min | 100/min | 10/min |
| General API | 60/min | 200/min | 30/min |

### Security Headers
All API responses include security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📈 Monitoring & Analytics

### Request Logging
Every API request is logged with:
- Request timestamp and duration
- User identification and IP address
- Endpoint accessed and HTTP method
- Response status and size
- Error details and stack traces

### Performance Metrics
- **Response Time**: Average < 200ms for standard operations
- **Uptime**: 99.9% availability SLA
- **Error Rate**: < 0.1% for successful operations
- **Throughput**: Handles 10,000+ requests per minute

### Health Check Endpoints
```http
GET /api/health
GET /api/v1/status
```

---

## 🔄 Integration Examples

### Authentication Flow
```javascript
// 1. User Registration
const signupResponse = await fetch('/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '+8801234567890',
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});

// 2. User Login
const loginResponse = await fetch('/api/v1/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+8801234567890',
    password: 'SecurePassword123!'
  })
});

const { data: { tokens } } = await loginResponse.json();

// 3. Authenticated Request
const ordersResponse = await fetch('/api/v1/order', {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Order Creation Flow
```javascript
// Create a new order
const orderData = {
  parcel: {
    from: "6744b8c1234567890abcdef1", // Bangladesh ID
    to: "6744b8c1234567890abcdef2",   // UK ID
    serviceType: "DHL Express",
    priority: "express",
    weight: "2.5 kg",
    sender: {
      name: "Sender Name",
      phone: "+8801234567890",
      email: "sender@example.com",
      address: {
        street: "123 Main St",
        city: "Dhaka",
        postal: "1000",
        country: "Bangladesh"
      }
    },
    receiver: {
      name: "Receiver Name",
      phone: "+447123456789",
      email: "receiver@example.com",
      address: {
        street: "456 High St",
        city: "London",
        postal: "SW1A 1AA",
        country: "United Kingdom"
      }
    },
    box: [{
      length: 30,
      width: 20,
      height: 15,
      weight: 2.5
    }],
    item: [{
      description: "Electronics",
      value: 150.00,
      quantity: 1,
      weight: 2.5
    }]
  },
  payment: {
    pType: "credit_card",
    pAmount: 125.00
  }
};

const response = await fetch('/api/v1/order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
});
```

### Tracking Integration
```javascript
// Public tracking (no auth required)
const trackingResponse = await fetch('/api/v1/track/ZYP240115001');
const { data: { tracking } } = await trackingResponse.json();

console.log(`Package status: ${tracking.currentStatus}`);
console.log(`Estimated delivery: ${tracking.estimatedDelivery}`);
```

---

## 🛠️ Development Guide

### Local Development Setup
1. **Environment Variables**: Configure required environment variables
2. **Database**: MongoDB connection and setup
3. **Services**: Email and SMS service configuration
4. **Security**: JWT secret keys and API configurations

### Testing
- **Unit Tests**: Individual function and method testing
- **Integration Tests**: API endpoint testing with real database
- **Load Testing**: Performance testing under high load
- **Security Testing**: Vulnerability scanning and penetration testing

### Deployment
- **Staging Environment**: Pre-production testing environment
- **Production Environment**: Live system with full monitoring
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Real-time performance and error tracking

---

## 📞 Support & Maintenance

### API Versioning
- **Current Version**: v1 (stable)
- **Deprecation Policy**: 6-month notice for major changes
- **Backward Compatibility**: Maintained for at least 12 months

### Support Channels
- **Documentation**: Comprehensive API documentation with examples
- **Developer Portal**: Interactive API explorer and testing tools  
- **Technical Support**: 24/7 support for critical issues
- **Community Forum**: Developer community and knowledge sharing

---

## 🎯 Performance & Scalability

### System Capabilities
- **Concurrent Users**: 10,000+ simultaneous users
- **Request Volume**: 1M+ requests per day
- **Data Storage**: MongoDB with optimized indexing
- **Response Time**: Average < 200ms for standard operations

### Optimization Features
- **Database Indexing**: Optimized queries for fast data retrieval
- **Caching Strategy**: Redis-based caching for frequently accessed data
- **CDN Integration**: Global content delivery for static assets
- **Load Balancing**: Horizontal scaling across multiple servers

---

**API Version**: 1.0  
**Last Updated**: January 15, 2024  
**Next Review**: July 15, 2024