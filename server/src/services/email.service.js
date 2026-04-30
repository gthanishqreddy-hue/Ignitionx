const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    // Non-fatal — don't throw
  }
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(139,92,246,0.2); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .body h2 { color: #a78bfa; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #cbd5e1; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .highlight { background: rgba(139,92,246,0.1); border-left: 3px solid #7c3aed; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .footer p { color: #475569; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 IgnitionX</h1>
      <p>Ignite Ideas. Accelerate Dreams.</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} IgnitionX. All rights reserved.</p>
      <p>You're receiving this because you have an account at IgnitionX.</p>
    </div>
  </div>
</body>
</html>
`;

exports.sendWelcomeEmail = async (user, verifyUrl) => {
  await sendEmail({
    to: user.email,
    subject: '🔥 Welcome to IgnitionX — Verify Your Email',
    html: baseTemplate(`
      <h2>Welcome, ${user.name}! 🚀</h2>
      <p>You're now part of a community that turns bold ideas into reality. Verify your email to unlock everything IgnitionX has to offer.</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      <div class="highlight">
        <p>⏰ This link expires in 24 hours.</p>
      </div>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: '🔐 IgnitionX — Password Reset Request',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${user.name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <div class="highlight">
        <p>⏰ This link expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `),
  });
};

exports.sendContributionConfirmation = async (backer, campaign, contribution) => {
  await sendEmail({
    to: backer.email,
    subject: `🎉 You backed "${campaign.title}"!`,
    html: baseTemplate(`
      <h2>Thank you for believing in this idea! 💜</h2>
      <p>Hi ${backer.name}, your contribution has been confirmed.</p>
      <div class="highlight">
        <p><strong>Campaign:</strong> ${campaign.title}</p>
        <p><strong>Amount:</strong> $${contribution.amount} ${campaign.currency}</p>
        <p><strong>Status:</strong> ✅ Succeeded</p>
        <p><strong>Transaction ID:</strong> ${contribution.stripePaymentIntentId}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/campaigns/${campaign.slug}" class="btn">View Campaign</a>
    `),
  });
};

exports.sendCampaignFundedEmail = async (campaign) => {
  const User = require('../models/User');
  const creator = await User.findById(campaign.creator);
  if (!creator) return;

  await sendEmail({
    to: creator.email,
    subject: `🏆 Your campaign "${campaign.title}" is FULLY FUNDED!`,
    html: baseTemplate(`
      <h2>Congratulations! 🎊</h2>
      <p>Hi ${creator.name}, your campaign has hit its funding goal!</p>
      <div class="highlight">
        <p><strong>Campaign:</strong> ${campaign.title}</p>
        <p><strong>Raised:</strong> $${campaign.currentAmount} / $${campaign.goalAmount}</p>
        <p><strong>Backers:</strong> ${campaign.backersCount}</p>
      </div>
      <p>Log in to your creator dashboard to manage contributions and communicate with your backers.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    `),
  });
};

exports.sendRefundEmail = async (backer, contribution) => {
  await sendEmail({
    to: backer.email,
    subject: '💸 IgnitionX — Refund Processed',
    html: baseTemplate(`
      <h2>Your refund has been processed</h2>
      <p>Hi ${backer.name}, your refund of <strong>$${contribution.amount}</strong> has been issued and should appear within 5–10 business days.</p>
      <div class="highlight">
        <p><strong>Refund Amount:</strong> $${contribution.amount}</p>
        <p><strong>Original Transaction:</strong> ${contribution.stripePaymentIntentId}</p>
      </div>
      <p>Thank you for your support, and we hope to see you back soon!</p>
    `),
  });
};
