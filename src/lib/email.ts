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

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"Zypco" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`,
    html: `
      <div>
        <h2>Verify Your Email</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}



export async function sendLoginAlertEmail(email: string, name: string) {
  const mailOptions = {
    from: `"Zypco Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Login Alert",
    text: `Hi ${name},\n\nA new login was detected for your account.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nZypco Team`,
    html: `
      <div>
        <h2>Login Alert</h2>
        <p>Hi ${name},</p>
        <p>A new login was detected for your account.</p>
        <p>If this wasn't you, please contact support immediately.</p>
        <br />
        <p>Best regards,<br />Zypco Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}