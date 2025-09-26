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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#241F21; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#FEF400; border-radius:12px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.2); }
      .header { background:#241F21; text-align:center; padding:25px; }
      .header img { width:160px; max-width:80%; }
      .content { padding:30px; color:#241F21; line-height:1.7; }
      .content h2 { color:#241F21; font-size:24px; margin-bottom:20px; }
      .content p { font-size:16px; margin-bottom:20px; }
      .button { display:inline-block; padding:14px 28px; margin-top:10px; background:#241F21; color:#FEF400 !important; text-decoration:none; font-weight:bold; border-radius:8px; transition: 0.3s; }
      .button:hover { opacity:0.9; }
      .footer { background:#241F21; text-align:center; font-size:13px; color:#FEF400; padding:20px; border-top:1px solid #FEF400; }
      a { color:#FEF400; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="{{logoUrl}}" alt="Zypco Logo" />
      </div>

      <!-- Content -->
      <div class="content">
        <h2>{{title}}</h2>
        <p>{{message}}</p>
        {{#actionUrl}}
        <a href="{{actionUrl}}" class="button">{{actionText}}</a>
        {{/actionUrl}}
      </div>

      <!-- Footer -->
      <div class="footer">
        &copy; ${new Date().getFullYear()} Zypco International Courier. All rights reserved.<br/>
        24/7 Support: <a href="mailto:support@zypco.com">support@zypco.com</a>
      </div>
    </div>
  </body>
  </html>
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
private renderTemplate(template: string | null, data: Record<string, any>): string {
  if (!template) return "";

  let rendered = template;

  // Ensure logo is included dynamically
  if (!data.logoUrl) {
    data.logoUrl = `${process.env.PUBLIC_APP_URL}/logo.png`; // your logo path
  }

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
      logoUrl: `${process.env.PUBLIC_APP_URL}/logo.png`,
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
      logoUrl: `${process.env.PUBLIC_APP_URL}/logo.png`,
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