import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
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
    this.transporter = nodemailer.createTransport({
      service: "gmail",
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
      const templatesPath = path.join(process.cwd(), "src/templates/email");

      // Base template
      const baseHtml = (await this.loadTemplate(templatesPath, "base.html")) || this.fallbackHtml();
      const baseText = (await this.loadTemplate(templatesPath, "base.txt")) || this.fallbackText();

      const templateNames = [
        "welcome",
        "verification",
        "password-reset",
        "order-confirmation",
        "order-update",
        "notification",
        "security-alert",
      ];

      for (const name of templateNames) {
        const html = (await this.loadTemplate(templatesPath, `${name}.html`)) || baseHtml;
        const text = (await this.loadTemplate(templatesPath, `${name}.txt`)) || baseText;

        const subject = `Zypco - ${name.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;

        this.templates.set(name, { subject, html, text });
      }

      // Always set base as fallback
      this.templates.set("base", { subject: "Zypco Notification", html: baseHtml, text: baseText });
    } catch (err) {
      console.error("Failed to load email templates:", err);
    }
  }

  private async loadTemplate(basePath: string, fileName: string): Promise<string | null> {
    try {
      const filePath = path.join(basePath, fileName);
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  private fallbackHtml(): string {
    return `
      <h2>{{title}}</h2>
      <p>{{message}}</p>
      {{#actionUrl}}<a href="{{actionUrl}}">{{actionText}}</a>{{/actionUrl}}
    `;
  }

  private fallbackText(): string {
    return `
      {{title}}
      {{message}}
      {{#actionUrl}}{{actionText}}: {{actionUrl}}{{/actionUrl}}
    `;
  }

  /**
   * Render template with simple mustache syntax
   */
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderTemplate(template: string | null, data: Record<string, any>): string {
    if (!template) return ""; // Prevent crash
    let rendered = template;

    // Replace variables {{variable}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      rendered = rendered.replace(regex, String(value ?? ""));
    });

    // Handle conditional blocks {{#variable}} ... {{/variable}}
    Object.entries(data).forEach(([key, value]) => {
      const blockRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{\\/${key}\\}\\}`, "g");
      rendered = value ? rendered.replace(blockRegex, "$1") : rendered.replace(blockRegex, "");
    });

    return rendered;
  }

  /**
   * Send transactional email
   */
  async sendTransactionalEmail(data: TransactionalEmailData): Promise<boolean> {
    try {
      const template = this.templates.get(data.template) || this.templates.get("base")!;
      const html = this.renderTemplate(template.html, data.data);
      const text = this.renderTemplate(template.text, data.data);

      await this.transporter.sendMail({
        from: `"Zypco Courier" <${process.env.EMAIL_USER}>`,
        to: data.to,
        subject: data.subject || template.subject,
        html,
        text,
      });

      return true;
    } catch (err) {
      console.error("Failed to send transactional email:", err);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(userData: { email: string; name: string; code: string }): Promise<boolean> {
    const verificationUrl = `${process.env.PUBLIC_APP_URL}/auth/verify?email=${userData.email}&code=${userData.code}`;
    return this.sendTransactionalEmail({
      to: userData.email,
      subject: "Verify Your Zypco Account",
      template: "verification",
      data: {
        name: userData.name,
        title: "Verify Your Email Address",
        message: `Please verify your email by clicking the button below or using this code: ${userData.code}`,
        actionUrl: verificationUrl,
        actionText: "Verify Account",
        verificationCode: userData.code,
      },
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userData: { email: string; name: string; verificationCode?: string }): Promise<boolean> {
    const verificationUrl = userData.verificationCode
      ? `${process.env.PUBLIC_APP_URL}/auth/verify?code=${userData.verificationCode}`
      : `${process.env.PUBLIC_APP_URL}/dashboard`;

    return this.sendTransactionalEmail({
      to: userData.email,
      subject: "Welcome to Zypco International Courier!",
      template: "welcome",
      data: {
        name: userData.name,
        title: `Welcome to Zypco, ${userData.name}!`,
        message:
          "Thank you for joining Zypco International Courier. Your account is ready to start shipping worldwide.",
        actionUrl: verificationUrl,
        actionText: userData.verificationCode ? "Verify Your Account" : "Get Started",
        verificationCode: userData.verificationCode,
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
    } catch (err) {
      console.error("Email configuration test failed:", err);
      return false;
    }
  }
}

export const emailService = new EmailService();