import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verification Email
export async function sendVerificationEmail(email: string, code: string) {
  const verificationUrl = `${process.env.PUBLIC_APP_URL}/auth/verify?code=${code}`;

  const mailOptions = {
    from: `"Zypco" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Zypco Account",
    text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f4f7; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background-color:#fff; border-radius:8px; overflow:hidden;">
          <div style="background-color:#0d6efd; text-align:center; padding:20px;">
            <img src="${process.env.PUBLIC_APP_URL}/logo.png" alt="Zypco Logo" style="width:150px;" />
          </div>
          <div style="padding:20px;">
            <h2 style="color:#0d6efd;">Verify Your Email</h2>
            <p>Your verification code is: <strong>${code}</strong></p>
            <p>This code will expire in 15 minutes.</p>
            <a href="${verificationUrl}" style="display:inline-block; padding:12px 24px; margin-top:20px; background-color:#0d6efd; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">Verify Account</a>
          </div>
          <div style="padding:10px 20px; font-size:12px; color:#777; text-align:center;">
            &copy; ${new Date().getFullYear()} Zypco International Courier. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Login Alert Email
export async function sendLoginAlertEmail(email: string, name: string) {
  const mailOptions = {
    from: `"Zypco Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Login Alert",
    text: `Hi ${name},\n\nA new login was detected for your account.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nZypco Team`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f4f7; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background-color:#fff; border-radius:8px; overflow:hidden;">
          <div style="background-color:#0d6efd; text-align:center; padding:20px;">
            <img src="${process.env.PUBLIC_APP_URL}/logo.png" alt="Zypco Logo" style="width:150px;" />
          </div>
          <div style="padding:20px;">
            <h2 style="color:#0d6efd;">Login Alert</h2>
            <p>Hi ${name},</p>
            <p>A new login was detected for your account.</p>
            <p>If this wasn't you, please contact support immediately.</p>
            <br />
            <p>Best regards,<br />Zypco Team</p>
          </div>
          <div style="padding:10px 20px; font-size:12px; color:#777; text-align:center;">
            &copy; ${new Date().getFullYear()} Zypco International Courier. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}