import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Create transporter
const createTransporter = () => {
    // For development, we'll use a test service like Ethereal
    // In production, you'd use your actual SMTP service
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return transporter;
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Bonstay" <${process.env.EMAIL_FROM || 'noreply@bonstay.com'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        // For Ethereal (development), log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// Email templates
export const generateWelcomeEmailTemplate = (userData: {
    userId: string;
    name: string;
    email: string;
    userType: string;
}) => {
    const { userId, name, email, userType } = userData;

    const subject = `Welcome to Bonstay - Your Account Details`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Bonstay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .user-details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .user-id {
          font-size: 18px;
          font-weight: bold;
          color: #667eea;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Bonstay!</h1>
        <p>Your account has been successfully created</p>
      </div>

      <div class="content">
        <h2>Hello ${name}!</h2>
        <p>Thank you for registering with Bonstay. Your account has been successfully created and is ready to use.</p>

        <div class="user-details">
          <h3>Your Account Details:</h3>
          <p><strong>User ID:</strong> <span class="user-id">${userId}</span></p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Account Type:</strong> ${userType === 'admin' ? 'Administrator' : 'Regular User'}</p>
        </div>

        ${userType === 'admin' ?
            `<p>As an administrator, you have access to manage hotels, bookings, and user accounts. Please keep your login credentials secure.</p>` :
            `<p>You can now browse and book hotels, manage your reservations, and enjoy our premium hospitality services.</p>`
        }

        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

        <a href="${process.env.FRONTEND_URL || 'https://bonstay.com'}" class="button">Visit Bonstay</a>

        <div class="footer">
          <p>Best regards,<br>The Bonstay Team</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
    Welcome to Bonstay!

    Hello ${name}!

    Thank you for registering with Bonstay. Your account has been successfully created.

    Your Account Details:
    - User ID: ${userId}
    - Name: ${name}
    - Email: ${email}
    - Account Type: ${userType === 'admin' ? 'Administrator' : 'Regular User'}

    ${userType === 'admin' ?
            'As an administrator, you have access to manage hotels, bookings, and user accounts.' :
            'You can now browse and book hotels, manage your reservations, and enjoy our premium hospitality services.'
        }

    If you have any questions, please contact our support team.

    Best regards,
    The Bonstay Team
  `;

    return { subject, html, text };
};

// Admin code approval email template
export const generateAdminCodeApprovalEmailTemplate = (requestData: {
    requestId: string;
    name: string;
    email: string;
    adminCode: string;
    department: string;
    organization: string;
    position: string;
}) => {
    const { requestId, name, email, adminCode, department, organization, position } = requestData;

    const subject = `Your Admin Code Request Has Been Approved - Bonstay`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Code Approved - Bonstay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .admin-code {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #28a745;
          text-align: center;
        }
        .code-display {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
          font-family: 'Courier New', monospace;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
          letter-spacing: 2px;
        }
        .details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Admin Code Approved!</h1>
        <p>Your request has been successfully approved</p>
      </div>

      <div class="content">
        <h2>Hello ${name}!</h2>
        <p>Congratulations! Your admin code request has been approved. You can now register as an administrator on Bonstay.</p>

        <div class="admin-code">
          <h3>Your Admin Code:</h3>
          <div class="code-display">${adminCode}</div>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>

        <div class="details">
          <h3>Request Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Organization:</strong> ${organization}</p>
          <p><strong>Position:</strong> ${position}</p>
        </div>

        <div class="warning">
          <strong>⚠️ Important Security Notice:</strong>
          <ul>
            <li>Keep this admin code secure and confidential</li>
            <li>Do not share it with unauthorized personnel</li>
            <li>Use it only for your admin registration</li>
            <li>The code can only be used once</li>
          </ul>
        </div>

        <p>To complete your admin registration, visit our registration page and select "Admin" as your user type. You'll need to provide this admin code during registration.</p>

        <a href="${process.env.FRONTEND_URL || 'https://bonstay.com'}/register" class="button">Register as Admin</a>

        <div class="footer">
          <p>Best regards,<br>The Bonstay Administration Team</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
    Admin Code Approved - Bonstay

    Hello ${name}!

    Congratulations! Your admin code request has been approved. You can now register as an administrator on Bonstay.

    Your Admin Code: ${adminCode}
    Request ID: ${requestId}

    Request Details:
    - Name: ${name}
    - Email: ${email}
    - Department: ${department}
    - Organization: ${organization}
    - Position: ${position}

    IMPORTANT SECURITY NOTICE:
    - Keep this admin code secure and confidential
    - Do not share it with unauthorized personnel
    - Use it only for your admin registration
    - The code can only be used once

    To complete your admin registration, visit our registration page and select "Admin" as your user type.

    Best regards,
    The Bonstay Administration Team
  `;

    return { subject, html, text };
};

// Password reset email template
export const generatePasswordResetEmailTemplate = (userData: {
    userId: string;
    name: string;
    email: string;
    resetToken: string;
}) => {
    const { userId, name, email, resetToken } = userData;

    const resetLink = `${process.env.FRONTEND_URL || 'https://bonstay.com'}/reset-password?token=${resetToken}&userId=${userId}`;

    const subject = `Password Reset Request - Bonstay`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Bonstay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .reset-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #ff6b6b;
        }
        .reset-button {
          display: inline-block;
          background: #ff6b6b;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
          text-align: center;
        }
        .token-display {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #495057;
          border: 1px solid #dee2e6;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .security-note {
          background: #e7f3ff;
          border: 1px solid #b3d7ff;
          color: #004085;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
        <p>We received a request to reset your password</p>
      </div>

      <div class="content">
        <h2>Hello ${name}!</h2>
        <p>You recently requested to reset your password for your Bonstay account. If you made this request, please click the button below to reset your password.</p>

        <div class="reset-section">
          <h3>Reset Your Password:</h3>
          <a href="${resetLink}" class="reset-button">Reset Password</a>

          <p><strong>Or copy and paste this link into your browser:</strong></p>
          <div class="token-display">${resetLink}</div>
        </div>

        <div class="security-note">
          <strong>🔒 Security Information:</strong>
          <ul>
            <li>This link will expire in 1 hour</li>
            <li>The link can only be used once</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password will remain unchanged until you reset it</li>
          </ul>
        </div>

        <div class="warning">
          <strong>⚠️ Important:</strong> If you did not request a password reset, please contact our support team immediately at support@bonstay.com. This could indicate unauthorized access to your account.
        </div>

        <p>If the button above doesn't work, you can also reset your password by visiting our website and using the "Forgot Password" link.</p>

        <div class="footer">
          <p>Best regards,<br>The Bonstay Security Team</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
    Password Reset Request - Bonstay

    Hello ${name}!

    You recently requested to reset your password for your Bonstay account.

    To reset your password, please visit the following link:
    ${resetLink}

    SECURITY INFORMATION:
    - This link will expire in 1 hour
    - The link can only be used once
    - If you didn't request this reset, please ignore this email
    - Your password will remain unchanged until you reset it

    IMPORTANT: If you did not request a password reset, please contact our support team immediately at support@bonstay.com.

    If the link above doesn't work, you can also reset your password by visiting our website and using the "Forgot Password" link.

    Best regards,
    The Bonstay Security Team
  `;

    return { subject, html, text };
};