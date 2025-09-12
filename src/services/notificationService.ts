/* prettier-ignore-file */
import connectDB from "@/config/db";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import { emailService } from "./emailService";

export interface NotificationData {
  userId?: string;
  phone?: string;
  email?: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "promo";
  priority?: "low" | "normal" | "high" | "urgent";
  category: "order" | "account" | "security" | "system" | "marketing";
  actionUrl?: string;
  actionText?: string;
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  channels?: ("email" | "sms" | "push" | "inapp")[];
  expiresAt?: Date;
}

export interface BulkNotificationData extends Omit<NotificationData, 'userId' | 'phone' | 'email'> {
  recipients: {
    userId?: string;
    phone?: string;
    email?: string;
  }[];
}

export class NotificationService {
  /**
   * Send notification to a user
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  static async sendNotification(p0?: { phone: string; email: string; name?: string; }, p1?: string, p2?: { addressId: unknown; label: string | undefined; addressLine: string; }, notificationData: NotificationData): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
  }> {
    try {
      await connectDB();

      // Find user if not provided with userId
      let user = null;
      if (notificationData.userId) {
        user = await User.findById(notificationData.userId);
      } else if (notificationData.phone) {
        user = await User.findOne({ phone: notificationData.phone });
      } else if (notificationData.email) {
        user = await User.findOne({ email: notificationData.email });
      }

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check user notification preferences
      const userPrefs = user.preferences?.notifications || { email: true, sms: true };
      const channels = notificationData.channels || ["inapp", "email"];

      // Create in-app notification
      const notification = new Notification({
        user: user._id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority || "normal",
        category: notificationData.category,
        actionUrl: notificationData.actionUrl,
        actionText: notificationData.actionText,
        data: notificationData.data,
        sentAt: new Date(),
        expiresAt: notificationData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await notification.save();

      // Send notifications through various channels
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deliveryPromises: Promise<any>[] = [];

      // Email notification
      if (channels.includes("email") && userPrefs.email) {
        deliveryPromises.push(
          
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
          emailService.sendNotificationEmail({
            to: user.email,
            subject: notificationData.title,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            actionUrl: notificationData.actionUrl,
            actionText: notificationData.actionText,
            data: notificationData.data,
          })
        );
      }
 

      // Push notification (placeholder - would integrate with FCM/APNS)
      if (channels.includes("push")) {
        
        deliveryPromises.push(this.sendPushNotification({userId: user._id,title: notificationData.title,body: notificationData.message,data: notificationData.data,}));
      }

      // Wait for all deliveries (but don't fail if some fail)
      const deliveryResults = await Promise.allSettled(deliveryPromises);
      
      // Log delivery results
      const deliveryStatus = {
        email: deliveryResults[0]?.status === "fulfilled" ? "sent" : "failed",
        sms: deliveryResults[1]?.status === "fulfilled" ? "sent" : "failed",
        push: deliveryResults[2]?.status === "fulfilled" ? "sent" : "failed",
      };

      // Update notification with delivery status (extend the model if needed)
      
      
      return {success: true,notificationId: notification._id,};

    } catch (error) {
      console.error("Error sending notification:", error);
      return { success: false, error: "Failed to send notification" };
    }
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotification(bulkData: BulkNotificationData): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      sentCount: 0,
      failedCount: 0,
      errors: [] as string[],
    };

    for (const recipient of bulkData.recipients) {
      const notificationData: NotificationData = {
        ...bulkData,
        userId: recipient.userId,
        phone: recipient.phone,
        email: recipient.email,
      };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
      const result = await this.sendNotification(notificationData);
      
      if (result.success) {
        results.sentCount++;
      } else {
        results.failedCount++;
        results.errors.push(result.error || "Unknown error");
      }
    }

    results.success = results.failedCount === 0;
    return results;
  }

  /**
   * Send order-related notifications
   */
  static async sendOrderNotification(
    orderData: {
      orderId: string;
      trackId: string;
      status: string;
      senderPhone?: string;
      receiverPhone?: string;
      senderEmail?: string;
      receiverEmail?: string;
    },
    event: "created" | "picked_up" | "in_transit" | "delivered" | "cancelled"
  ): Promise<void> {
    const notifications = this.getOrderNotificationTemplates(orderData, event);

    // Send to sender
    if (orderData.senderPhone) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await this.sendNotification({
        phone: orderData.senderPhone,
        ...notifications.sender,
        channels: ["email", "sms", "inapp"],
      });
    }

    // Send to receiver (for certain events)
    if (orderData.receiverPhone && ["created", "in_transit", "delivered"].includes(event)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await this.sendNotification({
        phone: orderData.receiverPhone,
        ...notifications.receiver,
        channels: ["email", "inapp"],
      });
    }
  }

  /**
   * Send authentication notifications
   */
  static async sendAuthNotification(
    userData: { phone: string; email: string; name: string },
    event: "welcome" | "login_alert" | "password_changed" | "account_locked"
  ): Promise<void> {
    const template = this.getAuthNotificationTemplate(userData, event);
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await this.sendNotification({
      phone: userData.phone,
      ...template,
      channels: event === "welcome" ? ["email", "sms", "inapp"] : ["email", "inapp"],
    });
  }

  /**
   * Send system notifications
   */
  static async sendSystemNotification(
    message: string,
    type: "maintenance" | "update" | "alert",
    targetUsers?: "all" | "admin" | string[]
  ): Promise<void> {


   
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
    let userQuery: any = { isActive: true };

    if (targetUsers === "admin") {
      userQuery.role = { $in: ["admin", "super_admin"] };
    } else if (Array.isArray(targetUsers)) {
      userQuery._id = { $in: targetUsers };
    }

    await connectDB();
    const users = await User.find(userQuery).select("_id phone email");

    
    const recipients = users.map(user => ({userId: user._id.toString(),phone: user.phone,email: user.email,}));

    await this.sendBulkNotification({
      recipients,
      title: type === "maintenance" ? "System Maintenance" : 
             type === "update" ? "System Update" : "System Alert",
      message,
      type: type === "alert" ? "warning" : "info",
      category: "system",
      channels: ["email", "inapp"],
    });
  }

  /**
   * Push notification placeholder (integrate with FCM/APNS)
   */
  private static async sendPushNotification(data: {
    userId: string;
    title: string;
    body: string;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>;
  }): Promise<boolean> {
    try {
      // Placeholder for push notification service
      // In production, integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
      
      console.log("Push notification would be sent:", {
        userId: data.userId,
        title: data.title,
        body: data.body,
        data: data.data,
      });

      return true;
    } catch (error) {
      console.error("Push notification error:", error);
      return false;
    }
  }

  /**
   * Get order notification templates
   */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getOrderNotificationTemplates(orderData: any, event: string) {
    const templates = {
      created: {
        sender: {
          title: "Order Confirmed",
          message: `Your order ${orderData.trackId} has been confirmed and will be picked up soon. Track your shipment for updates.`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/orders/${orderData.orderId}`,
          actionText: "View Order",
          data: orderData,
        },
        receiver: {
          title: "Package Coming Your Way",
          message: `A package with tracking ID ${orderData.trackId} is being sent to you. You'll receive updates on its progress.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        }
      },
      picked_up: {
        sender: {
          title: "Package Picked Up",
          message: `Your package ${orderData.trackId} has been picked up and is now in transit. Track for real-time updates.`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/track/${orderData.trackId}`,
          actionText: "Track Package",
          data: orderData,
        },
        receiver: {
          title: "Package in Transit",
          message: `Your incoming package ${orderData.trackId} is now in transit and on its way to you.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        }
      },
      in_transit: {
        sender: {
          title: "Package Update",
          message: `Your package ${orderData.trackId} is in transit and making good progress to its destination.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
        receiver: {
          title: "Package Update",
          message: `Your package ${orderData.trackId} is in transit and will be delivered soon.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        }
      },
      delivered: {
        sender: {
          title: "Package Delivered",
          message: `Great news! Your package ${orderData.trackId} has been successfully delivered. Thank you for choosing Zypco!`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/orders/${orderData.orderId}`,
          actionText: "Leave Review",
          data: orderData,
        },
        receiver: {
          title: "Package Delivered",
          message: `Your package ${orderData.trackId} has been delivered. We hope you're happy with your shipment!`,
          type: "success" as const,
          category: "order" as const,
          data: orderData,
        }
      },
      cancelled: {
        sender: {
          title: "Order Cancelled",
          message: `Your order ${orderData.trackId} has been cancelled. If you didn't request this, please contact support.`,
          type: "warning" as const,
          category: "order" as const,
          actionUrl: `/support`,
          actionText: "Contact Support",
          data: orderData,
        },
        receiver: {
          title: "Order Cancelled",
          message: `The package ${orderData.trackId} that was being sent to you has been cancelled.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        }
      }
    };

    return templates[event as keyof typeof templates];
  }

  /**
   * Get authentication notification templates
   */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getAuthNotificationTemplate(userData: any, event: string) {
    const templates = {
      welcome: {
        title: "Welcome to Zypco!",
        message: `Hi ${userData.name}! Welcome to Zypco International Courier. Your account is ready, and you can now ship packages worldwide with confidence.`,
        type: "success" as const,
        category: "account" as const,
        actionUrl: "/dashboard",
        actionText: "Get Started",
        data: { name: userData.name },
      },
      login_alert: {
        title: "New Login Detected",
        message: `Hi ${userData.name}, we detected a new login to your account. If this wasn't you, please secure your account immediately.`,
        type: "warning" as const,
        category: "security" as const,
        priority: "high" as const,
        actionUrl: "/account/security",
        actionText: "Review Security",
        data: { timestamp: new Date() },
      },
      password_changed: {
        title: "Password Changed",
        message: `Hi ${userData.name}, your password has been successfully changed. If you didn't make this change, please contact support immediately.`,
        type: "info" as const,
        category: "security" as const,
        priority: "high" as const,
        actionUrl: "/support",
        actionText: "Contact Support",
        data: { timestamp: new Date() },
      },
      account_locked: {
        title: "Account Locked",
        message: `Hi ${userData.name}, your account has been temporarily locked due to multiple failed login attempts. Please reset your password to regain access.`,
        type: "error" as const,
        category: "security" as const,
        priority: "urgent" as const,
        actionUrl: "/auth/reset-password",
        actionText: "Reset Password",
        data: { timestamp: new Date() },
      }
    };

    return templates[event as keyof typeof templates];
  }
}

export const notificationService = NotificationService;