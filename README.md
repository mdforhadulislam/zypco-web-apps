# Zypco International Courier Solutions

## Overview

Zypco is a modern international courier and logistics platform built with Next.js 15 and React 19. The application serves as a comprehensive solution for managing international shipping services, offering features like shipment tracking, order management, user authentication, and business logistics solutions. The platform supports multiple courier services including DHL, FedEx, UPS, and Aramex, providing customers with flexible shipping options and real-time tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router for modern React applications
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom utility classes and CSS variables
- **TypeScript**: Full TypeScript implementation for type safety
- **Icons**: Lucide React and React Icons for consistent iconography
- **Interactive Elements**: Custom Globe component using Cobe library for visual appeal

### Backend Architecture
- **API Structure**: RESTful API design with Next.js App Router API routes
- **Database**: MongoDB with Mongoose ODM for data modeling and relationships
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **Authorization**: Role-based access control (user, admin, moderator) with permission system
- **API Versioning**: Structured v1 API endpoints with consistent response format
- **Middleware**: CORS handling and request preprocessing

### Data Models
The system implements comprehensive data models including:
- **User Management**: User accounts with roles, preferences, and verification system
- **Order Processing**: Complete order lifecycle with tracking and status management
- **Address System**: Flexible address management with country references
- **Pricing Engine**: Dynamic pricing based on weight, destination, and service type
- **Notification System**: Real-time notifications for order updates and system events
- **Content Management**: Blog posts, reviews, and contact form handling

### Security & Communication
- **Email Integration**: Nodemailer for verification emails and notifications
- **Input Validation**: Server-side validation with proper error handling
- **Rate Limiting**: API rate limiting configuration for abuse prevention
- **Login History**: Comprehensive audit trail for security monitoring
- **API Keys**: Secure API key management for external integrations

### Development Environment
- **Replit Optimization**: Configured for Replit hosting with appropriate headers and rewrites
- **Hot Reloading**: Development server with auto-refresh capabilities
- **Font Optimization**: Next.js font optimization with Geist font family
- **Performance**: Experimental features enabled for React 19 compatibility

## External Dependencies

### Core Framework Dependencies
- **Next.js 15.4.5**: React framework with App Router
- **React 19.1.0**: Latest React version with new features
- **TypeScript 5**: Type safety and developer experience

### Database & Authentication
- **MongoDB**: Primary database through Mongoose 8.18.0
- **JWT**: JSON Web Tokens for authentication via jsonwebtoken 9.0.2
- **bcryptjs 3.0.2**: Password hashing and security

### UI & Styling
- **Tailwind CSS 4.0.0**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Modern icon library
- **Cobe 0.6.4**: 3D globe visualization component

### Email & Communication
- **Nodemailer 7.0.6**: Email sending capabilities for notifications and verification
- **SMTP Configuration**: Email service integration for transactional emails

### Utility Libraries
- **UUID 11.1.0**: Unique identifier generation
- **ShortID 2.2.17**: Short unique ID generation
- **Class Variance Authority**: Type-safe component variants
- **Clsx & Tailwind Merge**: Conditional CSS class handling

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Autoprefixer**: CSS vendor prefix automation
- **PostCSS**: CSS processing and optimization