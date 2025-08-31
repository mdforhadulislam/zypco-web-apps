import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const mailOptions = {
    from: `"Zypco" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Zypco!</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't sign up for Zypco, please ignore this email.</p>
        <p>Thanks,<br>The Zypco Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}