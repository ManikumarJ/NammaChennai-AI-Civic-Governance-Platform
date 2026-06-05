const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If SMTP configurations are not fully set, we will return null to fallback to console logs.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async (options) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"Namma Chennai Portal" <noreply@nammachennai.gov.in>';
  
  if (!transporter) {
    console.log('\n--- EMAIL NOTIFICATION LOG (MOCK) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (HTML):\n${options.html}`);
    console.log('-------------------------------------\n');
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Nodemailer sendMail failed:', error.message);
  }
};

const sendVerificationEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2E7D32; text-align: center;">Namma Chennai - Government Transparency Portal</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering on the Namma Chennai Grievance & Transparency Platform. Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not request this registration, please ignore this email.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: 'Namma Chennai - Verify Your Email Address',
    html,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0D47A1; text-align: center;">Namma Chennai - Password Reset</h2>
      <p>Dear ${name},</p>
      <p>You are receiving this email because you (or someone else) requested a password reset for your account on Namma Chennai.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #0D47A1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: 'Namma Chennai - Reset Your Password',
    html,
  });
};

const sendStatusChangeEmail = async (email, name, complaintId, title, status, note) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2E7D32; text-align: center;">Grievance Status Update</h2>
      <p>Dear ${name},</p>
      <p>The status of your complaint <strong>${complaintId}</strong>: <em>"${title}"</em> has been updated.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 5px solid #2E7D32; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>New Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #2E7D32;">${status}</span></p>
        <p style="margin: 0;"><strong>Official Note:</strong> ${note || 'No notes added.'}</p>
      </div>
      <p>You can view full progress, comments, and audit details in your Namma Chennai dashboard.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `Namma Chennai - Status Update for Complaint ${complaintId}`,
    html,
  });
};

const sendEscalationEmail = async (email, name, complaintId, title, escalationLevel, remainingDays) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #c62828; text-align: center;">⚠️ AI-Auto Escalation Alert</h2>
      <p>Dear ${name},</p>
      <p>A complaint under your jurisdiction has been escalated due to inaction.</p>
      <div style="background-color: #ffebee; padding: 15px; border-left: 5px solid #c62828; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Complaint ID:</strong> ${complaintId}</p>
        <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${title}</p>
        <p style="margin: 0 0 10px 0;"><strong>Escalation Level:</strong> <span style="font-weight: bold; color: #c62828;">${escalationLevel}</span></p>
        <p style="margin: 0;"><strong>Trigger Action:</strong> Inactivity exceeded the escalation SLA limit.</p>
      </div>
      <p>Please log in to the portal and take immediate corrective measures.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `⚠️ URGENT: Namma Chennai Complaint ${complaintId} Escalated to ${escalationLevel}`,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStatusChangeEmail,
  sendEscalationEmail,
};
