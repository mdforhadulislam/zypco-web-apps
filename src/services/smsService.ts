// SMS Service using Twilio (can be easily adapted for other providers)
import twilio from 'twilio';

interface SMSData {
  to: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "promo";
}

interface BulkSMSData {
  recipients: string[];
  message: string;
  type?: "info" | "success" | "warning" | "error" | "promo";
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    // Only initialize if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
      } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
      }
    } else {
      console.warn('SMS service not configured - missing Twilio credentials');
    }
  }

  /**
   * Send single SMS
   */
  async sendSMS(data: SMSData): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      console.warn('SMS service not configured');
      return false;
    }

    try {
      // Add prefix based on message type
      const typePrefix = this.getTypePrefix(data.type);
      const message = typePrefix ? `${typePrefix} ${data.message}` : data.message;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: data.to,
      });

      console.log(`SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(data: BulkSMSData): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    results: { phone: string; success: boolean; error?: string }[];
  }> {
    if (!this.isConfigured || !this.client) {
      console.warn('SMS service not configured');
      return {
        success: false,
        sentCount: 0,
        failedCount: data.recipients.length,
        results: data.recipients.map(phone => ({ 
          phone, 
          success: false, 
          error: 'SMS service not configured' 
        })),
      };
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const phone of data.recipients) {
      try {
        const sent = await this.sendSMS({
          to: phone,
          message: data.message,
          type: data.type,
        });

        if (sent) {
          sentCount++;
          results.push({ phone, success: true });
        } else {
          failedCount++;
          results.push({ phone, success: false, error: 'Send failed' });
        }
      } catch (error) {
        failedCount++;
        results.push({ 
          phone, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
      results,
    };
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    return this.sendSMS({
      to: phone,
      message: `Your Zypco verification code is: ${code}. This code expires in 15 minutes. Don't share this code with anyone.`,
      type: 'info',
    });
  }

  /**
   * Send order notification SMS
   */
  async sendOrderNotificationSMS(data: {
    phone: string;
    trackId: string;
    status: string;
    message?: string;
  }): Promise<boolean> {
    const defaultMessage = `Zypco Update: Your order ${data.trackId} status: ${data.status}. Track at ${process.env.PUBLIC_APP_URL}/track/${data.trackId}`;
    
    return this.sendSMS({
      to: data.phone,
      message: data.message || defaultMessage,
      type: 'info',
    });
  }

  /**
   * Send pickup notification SMS
   */
  async sendPickupNotificationSMS(data: {
    phone: string;
    date: string;
    timeSlot: string;
    address: string;
  }): Promise<boolean> {
    const message = `Zypco Pickup: Your package will be picked up on ${data.date} between ${data.timeSlot} at ${data.address}. Please have your package ready.`;
    
    return this.sendSMS({
      to: data.phone,
      message,
      type: 'info',
    });
  }

  /**
   * Send security alert SMS
   */
  async sendSecurityAlertSMS(data: {
    phone: string;
    alertType: string;
    location?: string;
  }): Promise<boolean> {
    const locationText = data.location ? ` from ${data.location}` : '';
    const message = `Zypco Security: ${data.alertType}${locationText}. If this wasn't you, secure your account immediately at ${process.env.PUBLIC_APP_URL}/security`;
    
    return this.sendSMS({
      to: data.phone,
      message,
      type: 'warning',
    });
  }

  /**
   * Send notification SMS
   */
  async sendNotificationSMS(data: SMSData): Promise<boolean> {
    // Limit SMS length and format for better delivery
    const truncatedMessage = data.message.length > 150 
      ? data.message.substring(0, 147) + '...' 
      : data.message;
    
    return this.sendSMS({
      to: data.to,
      message: `Zypco: ${truncatedMessage}`,
      type: data.type,
    });
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(phone: string, otp: string, purpose: string = 'verification'): Promise<boolean> {
    const message = `Your Zypco ${purpose} code is: ${otp}. Valid for 10 minutes. Never share this code.`;
    
    return this.sendSMS({
      to: phone,
      message,
      type: 'info',
    });
  }

  /**
   * Get message type prefix
   */
  private getTypePrefix(type?: string): string | null {
    const prefixes = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      promo: '🎉',
    };

    return type ? prefixes[type as keyof typeof prefixes] || null : null;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number for SMS
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }

  /**
   * Check SMS service status
   */
  async checkServiceStatus(): Promise<{
    configured: boolean;
    operational: boolean;
    balance?: string;
    error?: string;
  }> {
    if (!this.isConfigured || !this.client) {
      return {
        configured: false,
        operational: false,
        error: 'SMS service not configured',
      };
    }

    try {
      // Check account balance/status
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
      
      return {
        configured: true,
        operational: account.status === 'active',
        balance: account.status,
      };
    } catch (error) {
      return {
        configured: true,
        operational: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get delivery report for SMS
   */
  async getDeliveryReport(messageSid: string): Promise<{
    status: string;
    errorCode?: number;
    errorMessage?: string;
  } | null> {
    if (!this.isConfigured || !this.client) {
      return null;
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        status: message.status,
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Failed to get SMS delivery report:', error);
      return null;
    }
  }
}

export const smsService = new SMSService();