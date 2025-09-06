# Authentication API

This document covers all authentication-related endpoints for user registration, login, logout, and email verification.

## Base URL
`/api/v1/auth`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register a new user | No |
| POST | `/signin` | User login | No |
| POST | `/signout` | User logout | Yes |
| POST | `/verify-email` | Verify email with code | Yes |

---

## User Registration

### **POST** `/api/v1/auth/signup`

Register a new user account with email verification.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "John Doe",
  "phone": "+8801234567890",
  "email": "john@example.com", 
  "password": "SecurePassword123!"
}
```

#### Validation Rules
- **name**: Required, 2-100 characters, letters and spaces only
- **phone**: Required, valid international format (+country code)
- **email**: Required, valid email format, must be unique
- **password**: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character

#### Success Response (201)
```json
{
  "status": "201",
  "message": "User registered successfully. Please verify your email.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "user": {
      "id": "6744b8c1234567890abcdef0",
      "name": "John Doe",
      "phone": "+8801234567890",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "isVerified": false,
      "preferences": {
        "notifications": {
          "email": true,
          "sms": true
        }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "400",
  "message": "Validation failed",
  "error": {
    "field": "email",
    "message": "Email already exists"
  }
}
```

**422 - Password Weak**
```json
{
  "status": "422", 
  "message": "Password does not meet security requirements",
  "error": "Password must contain at least 8 characters with uppercase, lowercase, number and special character"
}
```

#### cURL Example
```bash
curl -X POST "https://your-domain.com/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+8801234567890",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

#### JavaScript Example
```javascript
const response = await fetch('https://your-domain.com/api/v1/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '+8801234567890', 
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});
const data = await response.json();
```

#### Security Features
- Password is hashed using bcrypt with 10 salt rounds
- Email verification code generated and sent immediately
- JWT token provided for authenticated requests
- Account created but marked as unverified until email confirmation

#### Notifications Triggered
- **Welcome email** sent to user's email address
- **SMS verification code** sent to phone number
- **Admin notification** about new user registration
- **Email verification reminder** scheduled for 24 hours

---

## User Login

### **POST** `/api/v1/auth/signin`

Authenticate user credentials and return access token.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "phone": "+8801234567890",
  "password": "SecurePassword123!"
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z", 
  "data": {
    "user": {
      "id": "6744b8c1234567890abcdef0",
      "name": "John Doe",
      "phone": "+8801234567890",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "preferences": {
        "notifications": {
          "email": true,
          "sms": true
        }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "lastLogin": "2024-01-14T15:20:00.000Z"
  }
}
```

#### Error Responses

**401 - Invalid Credentials**
```json
{
  "status": "401",
  "message": "Invalid phone number or password",
  "error": "Authentication failed"
}
```

**403 - Account Inactive**
```json
{
  "status": "403",
  "message": "Account is deactivated",
  "error": "Please contact support to reactivate your account"
}
```

**429 - Too Many Attempts**
```json
{
  "status": "429",
  "message": "Too many login attempts",
  "error": "Please try again in 15 minutes"
}
```

#### Security Features
- Rate limiting: 5 attempts per 15 minutes per IP
- Login history tracking with IP and device information
- Automatic account lockout after 5 failed attempts
- Security alerts sent for suspicious login attempts

#### Notifications Triggered
- **Login success email** with timestamp and location
- **Security alert email** if login from new device/location  
- **SMS notification** for high-value account logins
- **Failed login alert** after 3 unsuccessful attempts

---

## User Logout

### **POST** `/api/v1/auth/signout`

Logout user and invalidate current session.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
None

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Logged out successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error Responses

**401 - Unauthorized**
```json
{
  "status": "401",
  "message": "Invalid or expired token",
  "error": "Please login again"
}
```

#### Security Features
- Token blacklisting (if implemented)
- Login history updated with logout timestamp
- Session cleanup and security event logging

#### Notifications Triggered
- **Logout confirmation email** with timestamp
- **Security notification** if logout from suspicious location

---

## Email Verification

### **POST** `/api/v1/auth/verify-email`

Verify user email address using verification code.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "code": "A1B2C3"
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Email verified successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "user": {
      "id": "6744b8c1234567890abcdef0",
      "isVerified": true,
      "verifiedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 - Invalid Code**
```json
{
  "status": "400",
  "message": "Invalid verification code",
  "error": "Please check the code and try again"
}
```

**410 - Code Expired**
```json
{
  "status": "410",
  "message": "Verification code has expired",
  "error": "Please request a new verification code"
}
```

#### Security Features
- Verification codes expire after 15 minutes
- Maximum 5 attempts per code
- New code required after expiration
- Email domain validation and blacklist checking

#### Notifications Triggered
- **Email verification success** confirmation
- **Welcome email** with account features overview
- **SMS confirmation** of successful verification

---

## Resend Verification Code

### **POST** `/api/v1/auth/resend-verification`

Request a new email verification code.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "New verification code sent to your email",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "expiresAt": "2024-01-15T10:45:00.000Z"
  }
}
```

#### Rate Limiting
- Maximum 3 resend requests per hour
- 5 minute cooldown between requests

---

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)  
- At least one digit (0-9)
- At least one special character (!@#$%^&*)
- Cannot contain common passwords
- Cannot be similar to email or phone

### Token Management
- JWT tokens expire after 24 hours
- Use HTTPS in production
- Store tokens securely (not in localStorage for sensitive apps)
- Implement token refresh mechanism
- Validate tokens on every protected request

### Rate Limiting
- **Signup:** 3 requests per hour per IP
- **Login:** 5 requests per 15 minutes per IP
- **Logout:** 10 requests per minute per user
- **Email verification:** 10 requests per hour per user

### Account Security
- Email verification required for account activation
- Phone number verification for sensitive operations
- Account lockout after multiple failed attempts
- Security event logging and monitoring
- Suspicious activity detection and alerts

---

**Last Updated:** January 15, 2024