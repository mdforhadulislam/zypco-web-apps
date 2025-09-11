import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationEmailData {
  to: string;
  subject: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "promo";
  actionUrl?: string;
  actionText?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

interface TransactionalEmailData {
  to: string;
  subject: string;
  template: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() { 
    
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.loadEmailTemplates();
  }

  /**
   * Load email templates from file system
   */
  private async loadEmailTemplates(): Promise<void> {
    try {
      const templatesPath = path.join(process.cwd(), 'src/templates/email');
      
      // Base template
      const baseHtml = await this.loadTemplate(templatesPath, 'base.html');
      const baseText = await this.loadTemplate(templatesPath, 'base.txt');

      // Individual templates
      const templateNames = [
        'welcome', 'verification', 'password-reset', 'order-confirmation',
        'order-update', 'notification', 'security-alert'
      ];

      for (const templateName of templateNames) {
        try {
          const html = await this.loadTemplate(templatesPath, `${templateName}.html`) || baseHtml;
          const text = await this.loadTemplate(templatesPath, `${templateName}.txt`) || baseText;
          
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
          this.templates.set(templateName, {subject: `Zypco - ${templateName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,html,text,});
        } catch (error) {
          console.warn(`Failed to load template ${templateName}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
      this.createFallbackTemplates();
    }
  }

  /**
   * Load template file
   */
  private async loadTemplate(basePath: string, fileName: string): Promise<string | null> {
    try {
      const filePath = path.join(basePath, fileName);
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  /**
   * Create fallback templates if files don't exist
   */
  private createFallbackTemplates(): void {
    const baseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{subject}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Zypco International Courier</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{message}}</p>
            {{#actionUrl}}
            <a href="{{actionUrl}}" class="button">{{actionText}}</a>
            {{/actionUrl}}
          </div>
          <div class="footer">
            <p>© 2024 Zypco International Courier Solutions. All rights reserved.</p>
            <p>Visit us at <a href="https://zypco.com">zypco.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const baseText = `
      ZYPCO INTERNATIONAL COURIER
      
      {{title}}
      
      {{message}}
      
      {{#actionUrl}}
      {{actionText}}: {{actionUrl}}
      {{/actionUrl}}
      
      © 2024 Zypco International Courier Solutions. All rights reserved.
      Visit us at https://zypco.com
    `;

    this.templates.set('base', { subject: 'Zypco Notification', html: baseHtml, text: baseText });
    this.templates.set('notification', { subject: 'Zypco Notification', html: baseHtml, text: baseText });
    this.templates.set('welcome', { subject: 'Welcome to Zypco!', html: baseHtml, text: baseText });
  }

  /**
   * Render template with data using simple mustache-like syntax
   */
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    // Replace simple variables {{variable}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#variable}} ... {{/variable}}
    Object.entries(data).forEach(([key, value]) => {
      const blockRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{\\/${key}\\}\\}`, 'g');
      if (value) {
        rendered = rendered.replace(blockRegex, '$1');
      } else {
        rendered = rendered.replace(blockRegex, '');
      }
    });

    return rendered;
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(data: NotificationEmailData): Promise<boolean> {
    try {
      const template = this.templates.get('notification') || this.templates.get('base')!;
      
      const emailData = {
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        actionText: data.actionText || 'View Details',
        type: data.type,
        ...data.data,
      };

      const html = this.renderTemplate(template.html, emailData);
      const text = this.renderTemplate(template.text, emailData);

      await this.transporter.sendMail({
        from: `"Zypco Courier" <${process.env.EMAIL_USER}>`,
        to: data.to,
        subject: data.subject,
        html,
        text,
      });

      return true;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }

  /**
   * Send transactional email
   */
  async sendTransactionalEmail(data: TransactionalEmailData): Promise<boolean> {
    try {
      const template = this.templates.get(data.template) || this.templates.get('base')!;
      
      const html = this.renderTemplate(template.html, data.data);
      const text = this.renderTemplate(template.text, data.data);

      await this.transporter.sendMail({
        from: `"Zypco Courier" <${process.env.EMAIL_USER}>`,
        to: data.to,
        subject: data.subject,
        html,
        text,
      });

      return true;
    } catch (error) {
      console.error('Failed to send transactional email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userData: { email: string; name: string; verificationCode?: string }): Promise<boolean> {
    const verificationUrl = userData.verificationCode 
      ? `${process.env.PUBLIC_APP_URL}/auth/verify?code=${userData.verificationCode}`
      : undefined;

    return this.sendTransactionalEmail({
      to: userData.email,
      subject: 'Welcome to Zypco International Courier!',
      template: 'welcome',
      data: {
        name: userData.name,
        title: `Welcome to Zypco, ${userData.name}!`,
        message: 'Thank you for joining Zypco International Courier. Your account is ready to start shipping packages worldwide with confidence and reliability.',
        actionUrl: verificationUrl || `${process.env.PUBLIC_APP_URL}/dashboard`,
        actionText: userData.verificationCode ? 'Verify Your Account' : 'Get Started',
        verificationCode: userData.verificationCode,
      },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(userData: { email: string; name: string; code: string }): Promise<boolean> {
    const verificationUrl = `${process.env.PUBLIC_APP_URL}/auth/verify?code=${userData.code}`;

    return this.sendTransactionalEmail({
      to: userData.email,
      subject: 'Verify Your Zypco Account',
      template: 'verification',
      data: {
        name: userData.name,
        title: 'Verify Your Email Address',
        message: `Please verify your email address by clicking the button below or entering this code: ${userData.code}`,
        actionUrl: verificationUrl,
        actionText: 'Verify Account',
        verificationCode: userData.code,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userData: { email: string; name: string; resetToken: string }): Promise<boolean> {
    const resetUrl = `${process.env.PUBLIC_APP_URL}/auth/reset-password?token=${userData.resetToken}`;

    return this.sendTransactionalEmail({
      to: userData.email,
      subject: 'Reset Your Zypco Password',
      template: 'password-reset',
      data: {
        name: userData.name,
        title: 'Reset Your Password',
        message: 'You requested to reset your password. Click the button below to set a new password. This link will expire in 1 hour.',
        actionUrl: resetUrl,
        actionText: 'Reset Password',
        resetToken: userData.resetToken,
      },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(orderData: {
    email: string;
    name: string;
    trackId: string;
    orderId: string;
    serviceType: string;
    destination: string;
    estimatedDelivery: string;
  }): Promise<boolean> {
    return this.sendTransactionalEmail({
      to: orderData.email,
      subject: `Order Confirmation - ${orderData.trackId}`,
      template: 'order-confirmation',
      data: {
        name: orderData.name,
        title: 'Order Confirmed!',
        message: `Your order ${orderData.trackId} has been confirmed. Your package will be sent via ${orderData.serviceType} to ${orderData.destination}.`,
        actionUrl: `${process.env.PUBLIC_APP_URL}/orders/${orderData.orderId}`,
        actionText: 'Track Your Order',
        trackId: orderData.trackId,
        serviceType: orderData.serviceType,
        destination: orderData.destination,
        estimatedDelivery: orderData.estimatedDelivery,
      },
    });
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlert(userData: {
    email: string;
    name: string;
    alertType: string;
    details: string;
    location?: string;
    timestamp: string;
  }): Promise<boolean> {
    return this.sendTransactionalEmail({
      to: userData.email,
      subject: 'Security Alert - Zypco Account',
      template: 'security-alert',
      data: {
        name: userData.name,
        title: 'Security Alert',
        message: `${userData.alertType}: ${userData.details}`,
        actionUrl: `${process.env.PUBLIC_APP_URL}/account/security`,
        actionText: 'Review Security Settings',
        alertType: userData.alertType,
        details: userData.details,
        location: userData.location,
        timestamp: userData.timestamp,
      },
    });
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();