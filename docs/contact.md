# Contact System API

This document covers the contact form and customer communication endpoints for managing inquiries, complaints, and support requests.

## Base URL
`/api/v1/contact`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contact` | Submit contact form | No |
| GET | `/contact` | Get contact messages (Admin) | Yes (Admin) |
| GET | `/contact/{id}` | Get specific contact (Admin) | Yes (Admin) |
| PUT | `/contact/{id}` | Update contact status (Admin) | Yes (Admin) |
| POST | `/contact/{id}/reply` | Reply to contact (Admin) | Yes (Admin) |
| DELETE | `/contact/{id}` | Delete contact (Admin) | Yes (Admin) |

---

## Submit Contact Form

### **POST** `/api/v1/contact`

Submit a new contact form inquiry, complaint, or feedback.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "John Customer",
  "email": "john@example.com",
  "phone": "+8801234567890",
  "message": "I need help with tracking my order ZYP240115001. It's been stuck in customs clearance for 3 days and I haven't received any updates.",
  "category": "support",
  "priority": "normal",
  "orderReference": "ZYP240115001"
}
```

#### Validation Rules
- **name**: Required, 2-100 characters, letters and spaces
- **email**: Required, valid email format
- **phone**: Optional, international format if provided
- **message**: Required, 10-2000 characters
- **category**: Required, one of: `inquiry`, `complaint`, `feedback`, `support`
- **priority**: Optional, one of: `low`, `normal`, `high` (default: `normal`)
- **orderReference**: Optional, valid tracking ID format

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Contact form submitted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "contact": {
      "id": "6744b8c1234567890abcdef7",
      "ticketNumber": "CNT240115001",
      "name": "John Customer",
      "email": "john@example.com",
      "phone": "+8801234567890",
      "category": "support",
      "priority": "normal",
      "status": "new",
      "estimatedResponse": "2024-01-15T22:30:00.000Z",
      "submittedAt": "2024-01-15T10:30:00.000Z"
    }
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
    "field": "message",
    "message": "Message must be at least 10 characters long"
  }
}
```

**429 - Rate Limit Exceeded**
```json
{
  "status": "429",
  "message": "Too many contact form submissions",
  "error": "You can submit maximum 3 contact forms per hour"
}
```

#### Features
- **Automatic ticket number generation** with format CNT + YYMMDD + sequence
- **Smart categorization** based on message content
- **Priority assignment** based on keywords and category
- **Spam detection** and filtering
- **Duplicate detection** within 24 hours

#### Notifications Triggered
- **Confirmation email** to submitter with ticket number
- **Admin notification** for high-priority inquiries
- **Auto-response email** with expected response time
- **SMS notification** for urgent support requests (if phone provided)

---

## Get Contact Messages (Admin)

### **GET** `/api/v1/contact`

Retrieve contact messages with filtering and pagination (admin only).

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
```

#### Query Parameters
- `status` (string, optional) - Filter by status (`new`, `in-progress`, `resolved`)
- `category` (string, optional) - Filter by category (`inquiry`, `complaint`, `feedback`, `support`)
- `priority` (string, optional) - Filter by priority (`low`, `normal`, `high`)
- `assignedTo` (string, optional) - Filter by assigned staff member
- `startDate` (string, optional) - Filter from date (ISO format)
- `endDate` (string, optional) - Filter until date (ISO format)
- `search` (string, optional) - Search in name, email, or message
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `sort` (string, optional) - Sort field (`createdAt`, `priority`, `status`)
- `order` (string, optional) - Sort order (`asc`, `desc`)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Contact messages retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "contacts": [
      {
        "id": "6744b8c1234567890abcdef7",
        "ticketNumber": "CNT240115001",
        "name": "John Customer",
        "email": "john@example.com",
        "phone": "+8801234567890",
        "category": "support",
        "priority": "high",
        "status": "new",
        "isRead": false,
        "assignedTo": {
          "id": "6744b8c1234567890abcdef8",
          "name": "Support Agent 1",
          "email": "agent1@zypco.com"
        },
        "replyCount": 0,
        "lastReply": null,
        "orderReference": "ZYP240115001",
        "submittedAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "limit": 20,
      "totalPages": 7,
      "hasNext": true,
      "hasPrevious": false
    },
    "summary": {
      "totalContacts": 127,
      "statusCounts": {
        "new": 23,
        "in-progress": 45,
        "resolved": 59
      },
      "categoryDistribution": {
        "support": 48,
        "inquiry": 35,
        "complaint": 28,
        "feedback": 16
      },
      "priorityDistribution": {
        "high": 12,
        "normal": 89,
        "low": 26
      }
    }
  }
}
```

#### Admin Features
- **Bulk actions** for status updates
- **Assignment management** to staff members
- **Performance metrics** and response times
- **Escalation alerts** for overdue responses

---

## Get Specific Contact (Admin)

### **GET** `/api/v1/contact/{id}`

Retrieve detailed information about a specific contact message.

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
```

#### Path Parameters
- `id` (string, required) - Contact message ObjectId

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Contact details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "contact": {
      "id": "6744b8c1234567890abcdef7",
      "ticketNumber": "CNT240115001",
      "name": "John Customer",
      "email": "john@example.com",
      "phone": "+8801234567890",
      "message": "I need help with tracking my order ZYP240115001. It's been stuck in customs clearance for 3 days and I haven't received any updates.",
      "category": "support",
      "priority": "high",
      "status": "in-progress",
      "isRead": true,
      "orderReference": "ZYP240115001",
      "assignedTo": {
        "id": "6744b8c1234567890abcdef8",
        "name": "Support Agent 1",
        "email": "agent1@zypco.com",
        "assignedAt": "2024-01-15T11:00:00.000Z"
      },
      "replies": [
        {
          "id": "6744b8c1234567890abcdef9",
          "message": "Thank you for contacting us. I'm looking into your order status and will provide an update shortly.",
          "responder": {
            "id": "6744b8c1234567890abcdef8",
            "name": "Support Agent 1",
            "role": "support_agent"
          },
          "createdAt": "2024-01-15T11:15:00.000Z"
        },
        {
          "id": "6744b8c1234567890abcdef10",
          "message": "Your package has cleared customs and is now out for delivery. You should receive it within 24 hours.",
          "responder": {
            "id": "6744b8c1234567890abcdef8",
            "name": "Support Agent 1",
            "role": "support_agent"
          },
          "createdAt": "2024-01-15T14:30:00.000Z",
          "attachments": [
            {
              "fileName": "delivery_update.pdf",
              "fileUrl": "https://cdn.zypco.com/attachments/delivery_update_123.pdf",
              "fileSize": 45120
            }
          ]
        }
      ],
      "metadata": {
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "referrer": "https://zypco.com/track/ZYP240115001",
        "sentiment": "negative",
        "tags": ["tracking_issue", "customs", "delayed_delivery"],
        "relatedOrder": {
          "id": "6744b8c1234567890abcdef3",
          "trackId": "ZYP240115001",
          "status": "out-for-delivery"
        }
      },
      "timeline": [
        {
          "action": "submitted",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "actor": "customer"
        },
        {
          "action": "assigned",
          "timestamp": "2024-01-15T11:00:00.000Z",
          "actor": "system",
          "details": "Auto-assigned to Support Agent 1"
        },
        {
          "action": "status_changed",
          "timestamp": "2024-01-15T11:00:00.000Z",
          "actor": "agent",
          "details": "Changed from 'new' to 'in-progress'"
        },
        {
          "action": "replied",
          "timestamp": "2024-01-15T11:15:00.000Z",
          "actor": "agent"
        }
      ],
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

#### Enhanced Features
- **Related order information** if order reference provided
- **Conversation history** with full reply thread
- **Customer sentiment analysis** for priority adjustment
- **Automatic tagging** based on content analysis
- **Response time tracking** for SLA compliance

---

## Update Contact Status (Admin)

### **PUT** `/api/v1/contact/{id}`

Update contact message status, priority, or assignment.

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "status": "resolved",
  "priority": "normal",
  "assignedTo": "6744b8c1234567890abcdef8",
  "internalNotes": "Issue resolved by providing tracking update. Customer satisfied.",
  "tags": ["resolved", "tracking_issue", "customs"],
  "resolutionTime": 240
}
```

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Contact updated successfully",
  "timestamp": "2024-01-15T15:00:00.000Z",
  "data": {
    "contact": {
      "id": "6744b8c1234567890abcdef7",
      "ticketNumber": "CNT240115001",
      "status": "resolved",
      "priority": "normal",
      "assignedTo": {
        "id": "6744b8c1234567890abcdef8",
        "name": "Support Agent 1"
      },
      "resolutionTime": 240,
      "resolvedAt": "2024-01-15T15:00:00.000Z",
      "updatedAt": "2024-01-15T15:00:00.000Z"
    }
  }
}
```

#### Status Workflow
1. **new** - Just submitted, awaiting assignment
2. **in-progress** - Assigned and being worked on
3. **resolved** - Issue resolved, customer notified
4. **closed** - Final state, no further action needed

#### Notifications Triggered
- **Status update email** to customer for major changes
- **Resolution email** when marked as resolved
- **Team notification** for escalated issues

---

## Reply to Contact (Admin)

### **POST** `/api/v1/contact/{id}/reply`

Send a reply to a contact message.

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)
- `message` (text, required) - Reply message content
- `isPublic` (boolean, optional) - Whether customer can see reply (default: true)
- `attachments` (files, optional) - File attachments (max 5 files, 10MB each)
- `sendEmail` (boolean, optional) - Send email notification to customer (default: true)

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Reply sent successfully",
  "timestamp": "2024-01-15T11:15:00.000Z",
  "data": {
    "reply": {
      "id": "6744b8c1234567890abcdef9",
      "message": "Thank you for contacting us. I'm looking into your order status and will provide an update shortly.",
      "isPublic": true,
      "responder": {
        "id": "6744b8c1234567890abcdef8",
        "name": "Support Agent 1",
        "role": "support_agent"
      },
      "attachments": [],
      "emailSent": true,
      "createdAt": "2024-01-15T11:15:00.000Z"
    },
    "contact": {
      "id": "6744b8c1234567890abcdef7",
      "status": "in-progress",
      "replyCount": 1,
      "lastReply": "2024-01-15T11:15:00.000Z"
    }
  }
}
```

#### Reply Features
- **Rich text formatting** support in messages
- **File attachments** with automatic virus scanning
- **Email notifications** to customer with branded template
- **Internal notes** for team communication
- **Canned responses** for common inquiries

---

## Contact Analytics

### **GET** `/api/v1/contact/analytics`

Get contact system analytics and performance metrics.

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Contact analytics retrieved successfully",
  "data": {
    "metrics": {
      "totalContacts": 1247,
      "thisMonth": 89,
      "lastMonth": 76,
      "responseTime": {
        "average": "2.4 hours",
        "median": "1.8 hours",
        "sla": "4 hours",
        "slaCompliance": 94.2
      },
      "resolutionTime": {
        "average": "18.6 hours",
        "median": "12.4 hours",
        "target": "24 hours",
        "targetCompliance": 89.7
      }
    },
    "trends": {
      "volumeByDay": [
        { "date": "2024-01-08", "count": 12 },
        { "date": "2024-01-09", "count": 15 },
        { "date": "2024-01-10", "count": 8 }
      ],
      "categoryDistribution": {
        "support": 45,
        "inquiry": 28,
        "complaint": 18,
        "feedback": 9
      },
      "topIssues": [
        { "tag": "tracking_issue", "count": 34 },
        { "tag": "delivery_delay", "count": 28 },
        { "tag": "pricing_question", "count": 19 }
      ]
    }
  }
}
```

---

## Customer Self-Service

### FAQ Integration
- **Smart suggestions** based on message content
- **Related articles** from knowledge base
- **Video tutorials** for common issues
- **Order status integration** for tracking inquiries

### Automated Responses
- **Instant acknowledgment** for all submissions
- **Smart routing** based on category and priority
- **Escalation rules** for urgent issues
- **Follow-up reminders** for unresolved issues

---

## Security & Compliance

### Data Protection
- **Personal data encryption** at rest and in transit
- **Access logging** for all contact views and updates
- **Data retention policies** with automatic cleanup
- **GDPR compliance** with data export and deletion

### Spam Prevention
- **Rate limiting** to prevent abuse
- **Content filtering** for spam detection
- **IP blacklisting** for repeat offenders
- **CAPTCHA integration** for suspicious traffic

### Quality Assurance
- **Response quality scoring** for agents
- **Customer satisfaction surveys** after resolution
- **Escalation paths** for complex issues
- **Performance monitoring** and alerts

---

**Last Updated:** January 15, 2024