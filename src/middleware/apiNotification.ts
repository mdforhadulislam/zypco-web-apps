import { NextRequest } from "next/server";
import { notificationService } from "@/services/notificationService";
import { emailService } from "@/services/emailService";
import { AuthenticatedUser } from "./apiAuth";

interface ApiActivityData {
  user?: AuthenticatedUser;
  method: string;
  endpoint: string;
  success: boolean;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ipAddress?: string;
  error?: string;
  requestId?: string;
}

export class ApiNotificationMiddleware {
  /**
   * Send notifications and emails for API activities
   */
  static async notifyApiActivity(
    req: NextRequest,
    user: AuthenticatedUser | undefined,
    response: {
      success: boolean;
      status: number;
      message: string;
      endpoint: string;
      responseTime: number;
      error?: any;
      requestId?: string;
    }
  ): Promise<void> {
    try {
      const { method, url } = req;
      const endpoint = new URL(url).pathname;
      
      // Get client info
      const userAgent = req.headers.get("user-agent") || "Unknown";
      const ipAddress = this.getClientIP(req);

      const activityData: ApiActivityData = {
        user,
        method,
        endpoint,
        success: response.success,
        statusCode: response.status,
        responseTime: response.responseTime,
        userAgent,
        ipAddress,
        error: response.error ? String(response.error) : undefined,
        requestId: response.requestId,
      };

      // Send notifications based on activity type and importance
      await Promise.allSettled([
        this.sendActivityNotification(activityData),
        this.sendActivityEmail(activityData),
        this.logApiActivity(activityData),
      ]);
    } catch (error) {
      console.error("API Notification Error:", error);
      // Don't throw error to avoid breaking API response
    }
  }

  /**
   * Send in-app notifications for API activities
   */
  private static async sendActivityNotification(data: ApiActivityData): Promise<void> {
    if (!data.user) return;

    const { method, endpoint, success, statusCode } = data;
    
    // Define which endpoints should trigger notifications
    const notifiableEndpoints = [
      "/api/v1/orders",
      "/api/v1/auth/signin",
      "/api/v1/auth/signup",
      "/api/v1/pickups",
      "/api/v1/reviews",
      "/api/v1/notifications",
    ];

    const shouldNotify = notifiableEndpoints.some(pattern => 
      endpoint.includes(pattern) || endpoint.match(pattern)
    );

    if (!shouldNotify) return;

    // Determine notification type and message
    let title = "API Activity";
    let message = `${method} request to ${endpoint}`;
    let type: "info" | "success" | "warning" | "error" = "info";
    let category: "order" | "account" | "security" | "system" = "system";
    let priority: "low" | "normal" | "high" | "urgent" = "normal";

    // Customize notification based on endpoint and status
    if (endpoint.includes("/orders")) {
      category = "order";
      if (method === "POST" && success) {
        title = "New Order Created";
        message = "Your order has been successfully created";
        type = "success";
      } else if (method === "PUT" && success) {
        title = "Order Updated";
        message = "Your order has been updated";
        type = "info";
      }
    } else if (endpoint.includes("/auth/signin")) {
      category = "security";
      if (success) {
        title = "Login Successful";
        message = `Successful login from ${data.ipAddress}`;
        type = "success";
      } else {
        title = "Login Failed";
        message = `Failed login attempt from ${data.ipAddress}`;
        type = "warning";
        priority = "high";
      }
    } else if (endpoint.includes("/auth/signup")) {
      category = "account";
      if (success) {
        title = "Registration Successful";
        message = "Welcome to Zypco! Please verify your email address";
        type = "success";
      }
    } else if (endpoint.includes("/pickups")) {
      category = "order";
      if (method === "POST" && success) {
        title = "Pickup Scheduled";
        message = "Your pickup has been scheduled successfully";
        type = "success";
      }
    } else if (endpoint.includes("/reviews")) {
      category = "system";
      if (method === "POST" && success) {
        title = "Review Submitted";
        message = "Thank you for your feedback!";
        type = "success";
      }
    }

    // Add error information if request failed
    if (!success) {
      type = statusCode >= 500 ? "error" : "warning";
      priority = statusCode >= 500 ? "high" : "normal";
      message += ` (Status: ${statusCode})`;
      
      if (data.error) {
        message += ` - ${data.error}`;
      }
    }

    // Send notification
    await notificationService.sendNotification({
      userId: data.user.id,
      title,
      message,
      type,
      category,
      priority,
      channels: ["inapp", "email"],
      data: {
        endpoint,
        method,
        statusCode,
        timestamp: new Date(),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        requestId: data.requestId,
      },
    });
  }

  /**
   * Send email notifications for important API activities
   */
  private static async sendActivityEmail(data: ApiActivityData): Promise<void> {
    if (!data.user) return;

    const { method, endpoint, success, statusCode } = data;

    // Only send emails for important activities
    const emailableActivities = [
      { pattern: "/api/v1/auth/signin", methods: ["POST"], failuresOnly: true },
      { pattern: "/api/v1/auth/signup", methods: ["POST"], failuresOnly: false },
      { pattern: "/api/v1/orders", methods: ["POST"], failuresOnly: false },
      { pattern: "/api/v1/pickups", methods: ["POST"], failuresOnly: false },
    ];

    const emailableActivity = emailableActivities.find(activity => 
      endpoint.includes(activity.pattern) && 
      activity.methods.includes(method)
    );

    if (!emailableActivity) return;

    // Skip if we only want to email failures but this was successful
    if (emailableActivity.failuresOnly && success) return;

    let subject = "Zypco Account Activity";
    let template = "notification";
    let emailData: any = {
      name: data.user.name,
      timestamp: new Date().toLocaleString(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    // Customize email based on activity
    if (endpoint.includes("/auth/signin")) {
      if (success) {
        subject = "Successful Login - Zypco Account";
        emailData = {
          ...emailData,
          title: "Login Alert",
          message: `Your Zypco account was accessed successfully from IP address ${data.ipAddress}`,
          actionText: "View Account",
          actionUrl: `${process.env.PUBLIC_APP_URL}/dashboard`,
        };
      } else {
        subject = "Failed Login Attempt - Zypco Account";
        emailData = {
          ...emailData,
          title: "Security Alert",
          message: `A failed login attempt was made on your Zypco account from IP address ${data.ipAddress}`,
          actionText: "Secure Account",
          actionUrl: `${process.env.PUBLIC_APP_URL}/auth/reset-password`,
        };
        template = "security-alert";
      }
    } else if (endpoint.includes("/auth/signup")) {
      subject = "Welcome to Zypco International Courier";
      template = "welcome";
      emailData = {
        ...emailData,
        title: "Welcome to Zypco!",
        message: "Your account has been created successfully. Please verify your email address to get started.",
        actionText: "Verify Email",
        actionUrl: `${process.env.PUBLIC_APP_URL}/auth/email-verify?email=${encodeURIComponent(data.user.email)}`,
      };
    } else if (endpoint.includes("/orders") && method === "POST") {
      subject = "New Order Confirmation - Zypco";
      template = "order-confirmation";
      emailData = {
        ...emailData,
        title: "Order Confirmed",
        message: "Your shipping order has been confirmed and will be processed soon.",
        actionText: "Track Order",
        actionUrl: `${process.env.PUBLIC_APP_URL}/dashboard/orders`,
      };
    } else if (endpoint.includes("/pickups") && method === "POST") {
      subject = "Pickup Scheduled - Zypco";
      template = "order-update";
      emailData = {
        ...emailData,
        title: "Pickup Scheduled",
        message: "Your pickup has been scheduled successfully. We'll collect your package at the specified time.",
        actionText: "View Pickup Details",
        actionUrl: `${process.env.PUBLIC_APP_URL}/dashboard/pickups`,
      };
    }

    // Send email
    await emailService.sendTransactionalEmail({
      to: data.user.email,
      subject,
      template,
      data: emailData,
    });
  }

  /**
   * Log API activity for analytics
   */
  private static async logApiActivity(data: ApiActivityData): Promise<void> {
    // This could be extended to log to a separate analytics database
    // For now, just console log important activities
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: data.user ? {
        id: data.user.id,
        role: data.user.role,
        email: data.user.email,
      } : null,
      request: {
        method: data.method,
        endpoint: data.endpoint,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
      response: {
        success: data.success,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        error: data.error,
      },
      requestId: data.requestId,
    };

    // Log to console (could be replaced with proper logging service)
    if (data.success) {
      console.log("API Activity:", JSON.stringify(logEntry, null, 2));
    } else {
      console.error("API Error:", JSON.stringify(logEntry, null, 2));
    }

    // TODO: Implement database logging for analytics
    // await ApiActivityLog.create(logEntry);
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(req: NextRequest): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    
    const realIP = req.headers.get("x-real-ip");
    if (realIP) return realIP;
    
    const vercelIP = req.headers.get("x-vercel-forwarded-for");
    if (vercelIP) return vercelIP;
    
    return req.ip || "unknown";
  }
}

export default ApiNotificationMiddleware;