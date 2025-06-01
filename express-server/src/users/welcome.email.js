import transporter from '../utils/mail.js';

export const sendWelcomeEmail = async (to, name) => {
  if (!to || !name) {
    throw new Error("Missing email or name.");
  }

  const content = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: 'Welcome to Our Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #333333;">Hello ${name},</h2>
          <p style="font-size: 16px; color: #555555; line-height: 1.6;">
            🎉 <strong>Welcome to our platform!</strong> We’re excited to have you join us.
          </p>
          <p style="font-size: 16px; color: #555555; line-height: 1.6;">
            If you have any questions, feel free to reply to this email.
          </p>
          <div style="margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>
          <p style="font-size: 14px; color: #999999; margin-top: 40px;">
            Thanks,<br/>
            <strong>The Team</strong>
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(content);
};
