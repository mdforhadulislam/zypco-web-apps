/* prettier-ignore-file */
import connectDB from "@/config/db";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";

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

export interface userQueryData{
  isActive: boolean;
  role?: { $in: string[] };
  _id?: { $in: string[] };

}

export interface BulkNotificationData
  extends Omit<NotificationData, "userId" | "phone" | "email"> {
  recipients: {
    userId?: string;
    phone?: string;
    email?: string;
  }[];
}

export class NotificationService {
  /**
   * Send notification to a single user
   */
  static async sendNotification(
    notificationData: NotificationData
  ): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
  }> {
    try {
      await connectDB();

      // --- Find User ---
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

      const channels = notificationData.channels || ["inapp", "email"];

      const notification = new Notification({
        userId: user._id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority || "normal",
        category: notificationData.category,
        actionUrl: notificationData.actionUrl,
        actionText: notificationData.actionText,
        data: notificationData.data,
        sentAt: new Date(),
        expiresAt:
          notificationData.expiresAt ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      const savedNotification = await notification.save();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deliveryPromises: Promise<any>[] = [];

      if (channels.includes("push")) {
        deliveryPromises.push(
          this.sendPushNotification({
            userId: user._id.toString(),
            title: notificationData.title,
            body: notificationData.message,
            data: notificationData.data,
          })
        );
      }

      return { success: true, notificationId: savedNotification._id.toString() };
    } catch (error) {
      console.log(error);
      
      console.log("Error sending notification");
      return { success: false, error: "Failed to send notification" };
    }
  }

  /**
   * Send notifications in bulk
   */
  static async sendBulkNotification(
    bulkData: BulkNotificationData
  ): Promise<{
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
   * Order notifications
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

    // Sender
    if (orderData.senderPhone) {
      await this.sendNotification({
        phone: orderData.senderPhone,
        ...notifications.sender,
        channels: ["email", "sms", "inapp"],
      });
    }

    // Receiver
    if (
      orderData.receiverPhone &&
      ["created", "in_transit", "delivered"].includes(event)
    ) {
      await this.sendNotification({
        phone: orderData.receiverPhone,
        ...notifications.receiver,
        channels: ["email", "inapp"],
      });
    }
  }

  /**
   * Authentication notifications
   */
  static async sendAuthNotification(
    userData: { phone: string; email: string; name: string },
    event: "welcome" | "login_alert" | "password_changed" | "account_locked"
  ): Promise<void> {
    const template = this.getAuthNotificationTemplate(userData, event);

    await this.sendNotification({
      phone: userData.phone,
      email: userData.email,
      ...template,
      channels:
        event === "welcome" ? ["email", "sms", "inapp"] : ["email", "inapp"],
    });
  }

  /**
   * System notifications
   */
  static async sendSystemNotification(
    message: string,
    type: "maintenance" | "update" | "alert",
    targetUsers?: "all" | "admin" | string[]
  ): Promise<void> {
    // eslint-disable-next-line prefer-const
    let userQuery:userQueryData = { isActive: true };

    if (targetUsers === "admin") {
      userQuery.role = { $in: ["admin", "super_admin"] };
    } else if (Array.isArray(targetUsers)) {
      userQuery._id = { $in: targetUsers };
    }

    await connectDB();
    const users = await User.find(userQuery).select("_id phone email");

    const recipients = users.map((user) => ({
      userId: user._id.toString(),
      phone: user.phone,
      email: user.email,
    }));

    await this.sendBulkNotification({
      recipients,
      title:
        type === "maintenance"
          ? "System Maintenance"
          : type === "update"
          ? "System Update"
          : "System Alert",
      message,
      type: type === "alert" ? "warning" : "info",
      category: "system",
      channels: ["email", "inapp"],
    });
  }

  /**
   * Push notification (placeholder)
   */
  private static async sendPushNotification(data: {
    userId: string;
    title: string;
    body: string;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>;
  }): Promise<boolean> {
    try {
      console.log("Push notification would be sent:", data);
      return true;
    } catch (error) {
      console.error("Push notification error:", error);
      return false;
    }
  }

  /**
   * Order templates
   */
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getOrderNotificationTemplates(orderData: any, event: string) {
    const templates = {
      created: {
        sender: {
          title: "Order Confirmed",
          message: `Your order ${orderData.trackId} has been confirmed and will be picked up soon.`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/orders/${orderData.orderId}`,
          actionText: "View Order",
          data: orderData,
        },
        receiver: {
          title: "Package Coming Your Way",
          message: `A package with tracking ID ${orderData.trackId} is on its way to you.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
      },
      picked_up: {
        sender: {
          title: "Package Picked Up",
          message: `Your package ${orderData.trackId} has been picked up.`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/track/${orderData.trackId}`,
          actionText: "Track Package",
          data: orderData,
        },
        receiver: {
          title: "Package in Transit",
          message: `Your incoming package ${orderData.trackId} is in transit.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
      },
      in_transit: {
        sender: {
          title: "Package Update",
          message: `Your package ${orderData.trackId} is in transit.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
        receiver: {
          title: "Package Update",
          message: `Your package ${orderData.trackId} is on the way.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
      },
      delivered: {
        sender: {
          title: "Package Delivered",
          message: `Your package ${orderData.trackId} has been delivered.`,
          type: "success" as const,
          category: "order" as const,
          actionUrl: `/orders/${orderData.orderId}`,
          actionText: "Leave Review",
          data: orderData,
        },
        receiver: {
          title: "Package Delivered",
          message: `Your package ${orderData.trackId} has been delivered.`,
          type: "success" as const,
          category: "order" as const,
          data: orderData,
        },
      },
      cancelled: {
        sender: {
          title: "Order Cancelled",
          message: `Your order ${orderData.trackId} has been cancelled.`,
          type: "warning" as const,
          category: "order" as const,
          actionUrl: `/support`,
          actionText: "Contact Support",
          data: orderData,
        },
        receiver: {
          title: "Order Cancelled",
          message: `The package ${orderData.trackId} has been cancelled.`,
          type: "info" as const,
          category: "order" as const,
          data: orderData,
        },
      },
    };

    return templates[event as keyof typeof templates];
  }

  /**
   * Auth templates
   */
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getAuthNotificationTemplate(userData: any, event: string) {
    const templates = {
      welcome: {
        title: "Welcome to Zypco!",
        message: `Hi ${userData.name}! Welcome to Zypco International Courier.`,
        type: "success" as const,
        category: "account" as const,
        actionUrl: "/dashboard",
        actionText: "Get Started",
        data: { name: userData.name },
      },
      login_alert: {
        title: "New Login Detected",
        message: `Hi ${userData.name}, a new login was detected.`,
        type: "warning" as const,
        category: "security" as const,
        priority: "high" as const,
        actionUrl: "/account/security",
        actionText: "Review Security",
        data: { timestamp: new Date() },
      },
      password_changed: {
        title: "Password Changed",
        message: `Hi ${userData.name}, your password has been updated.`,
        type: "info" as const,
        category: "security" as const,
        priority: "high" as const,
        actionUrl: "/support",
        actionText: "Contact Support",
        data: { timestamp: new Date() },
      },
      account_locked: {
        title: "Account Locked",
        message: `Hi ${userData.name}, your account has been locked.`,
        type: "error" as const,
        category: "security" as const,
        priority: "urgent" as const,
        actionUrl: "/auth/reset-password",
        actionText: "Reset Password",
        data: { timestamp: new Date() },
      },
    };

    return templates[event as keyof typeof templates];
  }
}

export const notificationService = NotificationService;
