# Zypco API Documentation

Welcome to the comprehensive API documentation for Zypco International Courier Solutions. This documentation covers all available API endpoints, security considerations, and implementation details.

## 🚀 Quick Start

**Base URL:** `https://your-domain.com/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

## 📚 API Documentation Index

### Core Services
- [**Analytics**](./analytics.md) - Business analytics and reporting endpoints
- [**Health Check**](./health.md) - System health monitoring endpoints

### Authentication & User Management
- [**Authentication**](./auth.md) - User signup, signin, signout, and email verification
- [**User Accounts**](./user-accounts.md) - Account management and user profile operations
- [**Permissions**](./permissions.md) - Role-based access control and user permissions
- [**Login History**](./login-history.md) - User authentication history and security logs

### Content & Communication
- [**Blog Management**](./blog.md) - Blog posts, articles, and content management
- [**Contact System**](./contact.md) - Contact forms, inquiries, and customer communication
- [**Reviews**](./reviews.md) - Customer reviews and feedback management
- [**Notifications**](./notifications.md) - Real-time notifications and messaging

### Logistics & Operations
- [**Order Management**](./orders.md) - Create, track, and manage shipping orders
- [**Address Management**](./addresses.md) - User address management and validation
- [**Pickup Services**](./pickup.md) - Schedule and manage package pickups
- [**Tracking System**](./tracking.md) - Shipment tracking and status updates
- [**Pricing Engine**](./pricing.md) - Dynamic pricing and rate calculations

### Geographic & Reference Data
- [**Countries**](./countries.md) - Supported countries and location data
- [**API Configuration**](./api-config.md) - API settings and configuration management
- [**Offers & Promotions**](./offers.md) - Special offers and promotional campaigns

## 🔒 Security Features

### Authentication
- **JWT-based authentication** with secure token management
- **Role-based access control** (User, Admin, Moderator)
- **Session management** with automatic token refresh
- **Email verification** for account security

### Data Protection
- **Password encryption** using bcrypt with salt rounds
- **Input validation** and sanitization on all endpoints
- **SQL injection protection** through parameterized queries
- **XSS prevention** with output encoding
- **CORS configuration** for secure cross-origin requests

### Rate Limiting
- **Authentication endpoints:** 5 requests/minute
- **General endpoints:** 100 requests/minute  
- **Admin endpoints:** 200 requests/minute
- **IP-based rate limiting** with sliding window

## 📊 Response Format

All API responses follow a standardized format:

```json
{
  "status": "200",
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "path": "/api/v1/endpoint",
  "method": "GET",
  "requestId": "uuid-v4-string",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "env": "production",
  "data": {},
  "meta": {},
  "debugInfo": {
    "memoryUsage": {},
    "cpuUsage": {},
    "platform": "linux"
  }
}
```

## ❌ Error Handling

### Standard Error Response
```json
{
  "status": "400",
  "message": "Validation error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Detailed error information",
  "path": "/api/v1/endpoint",
  "requestId": "uuid-v4-string"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## 🔔 Notification System

The API automatically triggers notifications for various user actions:

### Email Notifications
- Account registration and verification
- Order confirmations and updates
- Pickup scheduling and reminders
- Security alerts and login notifications
- Contact form responses

### SMS Notifications  
- Phone verification codes
- Order status updates
- Pickup confirmations
- Delivery notifications
- Emergency security alerts

### In-App Notifications
- Real-time dashboard updates
- System announcements
- Promotional offers
- Service updates

## 🧪 Testing

### Authentication Header
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example cURL Request
```bash
curl -X GET "https://your-domain.com/api/v1/orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Example JavaScript Fetch
```javascript
const response = await fetch('https://your-domain.com/api/v1/orders', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

## 🌐 Environment Variables

Required environment variables for API operation:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=24h

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Application
NODE_ENV=production
PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 Getting Started

1. **Obtain API Access**
   - Register for an account
   - Verify your email address
   - Contact support for API key activation

2. **Authentication**
   - Use signup endpoint to create account
   - Login to receive JWT token
   - Include token in Authorization header

3. **Make Your First Request**
   ```bash
   curl -X GET "https://your-domain.com/api/v1/countries" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 📞 Support

- **Email:** api-support@zypco.com
- **Documentation Issues:** Create an issue in the repository
- **Status Page:** https://status.zypco.com
- **Response Time:** Within 24 hours for critical issues

## 📝 Changelog

### v1.0.0 (Current)
- Initial API release
- Core authentication and user management
- Order and tracking system
- Address and pickup management
- Blog and contact systems
- Real-time notifications

---

**Last Updated:** January 15, 2024  
**API Version:** v1.0.0  
**Documentation Version:** 1.0