# User Account Management API

This document covers user account management endpoints for profile updates, preferences, and account settings.

## Base URL
`/api/v1/auth/accounts`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/accounts/{phone}` | Get user account details | Yes |
| PUT | `/auth/accounts/{phone}` | Update user account | Yes |
| DELETE | `/auth/accounts/{phone}` | Deactivate account | Yes |
| POST | `/auth/accounts/{phone}/change-password` | Change password | Yes |
| POST | `/auth/accounts/{phone}/upload-avatar` | Upload profile picture | Yes |

---

## Get User Account

### **GET** `/api/v1/auth/accounts/{phone}`

Retrieve detailed account information for a specific user.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- `phone` (string, required) - User's phone number in international format

#### Success Response (200)
```json
{
  "status": "200",
  "message": "User account retrieved successfully",
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
      "avatar": "https://cdn.zypco.com/avatars/user123.jpg",
      "preferences": {
        "notifications": {
          "email": true,
          "sms": true,
          "push": true
        },
        "language": "en",
        "timezone": "UTC",
        "currency": "USD"
      },
      "statistics": {
        "totalOrders": 25,
        "completedOrders": 23,
        "totalSpent": 2875.50,
        "memberSince": "2024-01-01T00:00:00.000Z"
      },
      "addresses": {
        "total": 3,
        "defaultAddress": "6744b8c1234567890abcdef5"
      },
      "lastLogin": "2024-01-15T09:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Security Features
- User can only access their own account data
- Admin users can access any user's account
- Sensitive information (password) is never included in response
- Access logging for security monitoring

---

## Update User Account

### **PUT** `/api/v1/auth/accounts/{phone}`

Update user account information including name, email, and preferences.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `phone` (string, required) - User's phone number in international format

#### Request Body
```json
{
  "name": "John Smith Doe",
  "email": "john.smith@example.com",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "language": "en",
    "timezone": "America/New_York",
    "currency": "USD"
  }
}
```

#### Validation Rules
- **name**: 2-100 characters, letters and spaces only
- **email**: Valid email format, must be unique
- **preferences**: Optional object with notification settings
- **language**: ISO 639-1 language code
- **timezone**: Valid IANA timezone identifier
- **currency**: 3-letter currency code

#### Success Response (200)
```json
{
  "status": "200",
  "message": "User account updated successfully",
  "timestamp": "2024-01-15T11:45:00.000Z",
  "data": {
    "user": {
      "id": "6744b8c1234567890abcdef0",
      "name": "John Smith Doe",
      "email": "john.smith@example.com",
      "preferences": {
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        },
        "language": "en",
        "timezone": "America/New_York",
        "currency": "USD"
      },
      "updatedAt": "2024-01-15T11:45:00.000Z"
    },
    "updatedFields": ["name", "email", "preferences"],
    "emailVerificationRequired": true
  }
}
```

#### Special Cases
- **Email Change**: Requires re-verification, `isVerified` set to `false`
- **Phone Change**: Not allowed through this endpoint (contact support)
- **Admin Changes**: Admins can update any user's account

#### Notifications Triggered
- **Account update confirmation email**
- **Email verification email** (if email changed)
- **Security alert** for significant changes

---

## Change Password

### **POST** `/api/v1/auth/accounts/{phone}/change-password`

Change user password with current password verification.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword456@"
}
```

#### Validation Rules
- **currentPassword**: Must match existing password
- **newPassword**: Strong password requirements (8+ chars, uppercase, lowercase, number, special character)
- **Different passwords**: New password must be different from current

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Password changed successfully",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "passwordChanged": true,
    "changedAt": "2024-01-15T12:00:00.000Z",
    "securityRecommendations": [
      "Consider enabling two-factor authentication",
      "Review recent login activity",
      "Update passwords on other accounts if similar"
    ]
  }
}
```

#### Error Responses

**400 - Current Password Incorrect**
```json
{
  "status": "400",
  "message": "Current password is incorrect",
  "error": "Please verify your current password"
}
```

**422 - Password Too Weak**
```json
{
  "status": "422",
  "message": "New password does not meet requirements",
  "error": "Password must be at least 8 characters with uppercase, lowercase, number and special character"
}
```

#### Security Features
- Current password verification required
- Password strength validation
- Automatic logout from all other devices
- Login history updated with password change event

#### Notifications Triggered
- **Password change confirmation email**
- **Security alert SMS** with timestamp and location
- **All active sessions invalidated** (except current)

---

## Upload Avatar

### **POST** `/api/v1/auth/accounts/{phone}/upload-avatar`

Upload and update user profile picture.

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)
- `avatar` (file, required) - Image file (JPG, PNG, WebP)
- `crop` (string, optional) - JSON string with crop coordinates

#### File Requirements
- **Formats**: JPG, PNG, WebP
- **Max Size**: 5MB
- **Dimensions**: Minimum 150x150px, Maximum 2048x2048px
- **Aspect Ratio**: Square preferred (1:1)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Avatar uploaded successfully",
  "timestamp": "2024-01-15T12:30:00.000Z",
  "data": {
    "avatar": {
      "url": "https://cdn.zypco.com/avatars/user123_1642248600.jpg",
      "thumbnails": {
        "small": "https://cdn.zypco.com/avatars/thumbs/user123_150x150.jpg",
        "medium": "https://cdn.zypco.com/avatars/thumbs/user123_300x300.jpg",
        "large": "https://cdn.zypco.com/avatars/thumbs/user123_600x600.jpg"
      },
      "uploadedAt": "2024-01-15T12:30:00.000Z",
      "fileSize": 245760,
      "dimensions": {
        "width": 800,
        "height": 800
      }
    }
  }
}
```

#### Image Processing
- **Automatic resizing** to optimal dimensions
- **Thumbnail generation** in multiple sizes
- **Format optimization** for web delivery
- **CDN integration** for fast global access

---

## Deactivate Account

### **DELETE** `/api/v1/auth/accounts/{phone}`

Deactivate user account (soft delete with data retention).

#### Request Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "reason": "No longer using the service",
  "password": "UserPassword123!",
  "dataRetention": "6months"
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Account deactivated successfully",
  "timestamp": "2024-01-15T13:00:00.000Z",
  "data": {
    "deactivated": true,
    "deactivatedAt": "2024-01-15T13:00:00.000Z",
    "dataRetention": {
      "period": "6months",
      "deleteAfter": "2024-07-15T13:00:00.000Z"
    },
    "reactivationInstructions": "Contact support within 6 months to reactivate your account"
  }
}
```

#### Deactivation Process
1. **Account marked inactive** - cannot login
2. **Active orders preserved** - for completion and tracking
3. **Personal data anonymized** - after retention period
4. **Reactivation possible** - within retention period

#### Data Handling
- **Order History**: Preserved for business records
- **Personal Information**: Anonymized after retention period
- **Addresses**: Marked for deletion
- **Notifications**: Disabled immediately

---

## Account Statistics

### **GET** `/api/v1/auth/accounts/{phone}/statistics`

Get detailed account statistics and activity summary.

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Account statistics retrieved successfully",
  "data": {
    "statistics": {
      "orders": {
        "total": 25,
        "completed": 23,
        "inProgress": 1,
        "cancelled": 1,
        "averageValue": 115.02
      },
      "spending": {
        "totalSpent": 2875.50,
        "thisMonth": 340.25,
        "lastMonth": 280.75,
        "averageMonthly": 287.55
      },
      "shipping": {
        "totalPackages": 25,
        "totalWeight": "62.5kg",
        "countriesShippedTo": 8,
        "favoriteDestination": "United Kingdom"
      },
      "engagement": {
        "memberSince": "2024-01-01T00:00:00.000Z",
        "loginCount": 78,
        "lastActive": "2024-01-15T09:30:00.000Z",
        "averageSessionDuration": "15 minutes"
      }
    }
  }
}
```

---

## Privacy and Data Management

### Data Access Rights (GDPR Compliance)
- **Data Export**: Download all personal data in JSON format
- **Data Correction**: Update incorrect information
- **Data Deletion**: Request permanent data removal
- **Consent Management**: Control data usage preferences

### Security Features
- **Two-Factor Authentication**: Optional 2FA setup
- **Login History**: View all login attempts and locations
- **Device Management**: See and revoke access for devices
- **API Key Management**: Generate and manage API keys

### Account Recovery
- **Password Reset**: Via email or SMS verification
- **Account Reactivation**: Contact support within retention period
- **Data Recovery**: Restore from backups (admin only)

---

## Rate Limiting & Security

### Rate Limits
- **Account Updates**: 5 per hour per user
- **Password Changes**: 3 per day per user  
- **Avatar Uploads**: 5 per day per user
- **Statistics Access**: 20 per hour per user

### Security Monitoring
- **Suspicious Activity**: Automatic detection and alerts
- **Location Tracking**: Login location verification
- **Device Fingerprinting**: Recognize known devices
- **Audit Logging**: Complete activity trail

---

**Last Updated:** January 15, 2024