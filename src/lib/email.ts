import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// SendGrid configuration (alternative)
const sendGridConfig = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.EMAIL_SERVER_USER || 'MyViewrs123@outlook.com',
  fromName: 'Learning Platform',
};

// Email template for user invitations
export function generateInvitationEmail(
  email: string,
  name: string | null,
  role: string,
  courseName: string | null,
  message: string | null,
  signupUrl: string
) {
  const userName = name || email.split('@')[0];
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  
  return {
    subject: `You're invited to join our learning platform!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Learning Platform</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 2em;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .welcome-text {
            font-size: 1.2em;
            color: #6b7280;
          }
          .content {
            margin-bottom: 30px;
          }
          .role-badge {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            margin: 10px 0;
          }
          .course-info {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
          }
          .personal-message {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #f59e0b;
            font-style: italic;
          }
          .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
          }
          .warning {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 Learning Platform</div>
            <div class="welcome-text">Welcome aboard!</div>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            
            <p>You've been invited to join our learning platform as a <span class="role-badge">${roleDisplay}</span>.</p>
            
            ${courseName ? `
            <div class="course-info">
              <strong>📚 Course Assignment:</strong><br>
              You've been assigned to: <strong>${courseName}</strong>
            </div>
            ` : ''}
            
            ${message ? `
            <div class="personal-message">
              <strong>💬 Personal Message:</strong><br>
              "${message}"
            </div>
            ` : ''}
            
            <p>To get started, please click the button below to complete your account setup:</p>
            
            <div style="text-align: center;">
              <a href="${signupUrl}" class="cta-button">
                🚀 Complete Your Setup
              </a>
            </div>
            
            <div class="warning">
              ⚠️ <strong>Important:</strong> This invitation link will expire in 7 days for security reasons.
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Learning Platform Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to our Learning Platform!

Hello ${userName}!

You've been invited to join our learning platform as a ${roleDisplay}.

${courseName ? `Course Assignment: You've been assigned to ${courseName}` : ''}

${message ? `Personal Message: "${message}"` : ''}

To get started, please visit this link to complete your account setup:
${signupUrl}

Important: This invitation link will expire in 7 days for security reasons.

If you have any questions, please contact our support team.

Best regards,
The Learning Platform Team
    `
  };
}

// Send invitation email using SendGrid or Nodemailer
export async function sendInvitationEmail(
  email: string,
  name: string | null,
  role: string,
  courseName: string | null,
  message: string | null,
  signupUrl: string
) {
  try {
    const emailContent = generateInvitationEmail(
      email,
      name,
      role,
      courseName,
      message,
      signupUrl
    );

    // Use SendGrid if API key is available, otherwise use Nodemailer
    if (sendGridConfig.apiKey) {
      return await sendWithSendGrid(email, emailContent);
    } else {
      return await sendWithNodemailer(email, emailContent);
    }
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
}

// Send email using SendGrid
async function sendWithSendGrid(email: string, emailContent: { subject: string; html: string; text: string }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendGridConfig.apiKey);

  const msg = {
    to: email,
    from: {
      email: sendGridConfig.fromEmail,
      name: sendGridConfig.fromName,
    },
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  };

  const result = await sgMail.send(msg);
  console.log('SendGrid email sent successfully:', result[0].statusCode);
  return { success: true, messageId: result[0].headers['x-message-id'] };
}

// Send email using Nodemailer
async function sendWithNodemailer(email: string, emailContent: { subject: string; html: string; text: string }) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log('Nodemailer email sent successfully:', result.messageId);
  return { success: true, messageId: result.messageId };
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    if (sendGridConfig.apiKey) {
      // Test SendGrid
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(sendGridConfig.apiKey);
      console.log('SendGrid configuration is valid');
      return true;
    } else {
      // Test Nodemailer
      await transporter.verify();
      console.log('Nodemailer configuration is valid');
      return true;
    }
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
} 