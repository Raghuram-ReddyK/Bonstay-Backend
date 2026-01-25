import nodemailer from 'nodemailer';

// This script helps set up email credentials for development
// Run this to get Ethereal email credentials for testing

async function setupEmailCredentials() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('=== EMAIL SETUP FOR DEVELOPMENT ===');
    console.log('Update your .env file with these credentials:');
    console.log('');
    console.log(`EMAIL_HOST=smtp.ethereal.email`);
    console.log(`EMAIL_PORT=587`);
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASS=${testAccount.pass}`);
    console.log(`EMAIL_FROM=noreply@bonstay.com`);
    console.log('');
    console.log('These are temporary credentials for testing only.');
    console.log('In production, use your actual email service provider.');
    console.log('');
    console.log('For production email services:');
    console.log('- Gmail: Use App Passwords');
    console.log('- SendGrid: Use API keys');
    console.log('- AWS SES: Use SMTP credentials');
    console.log('- Other providers: Check their SMTP documentation');

  } catch (error) {
    console.error('Error setting up email credentials:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupEmailCredentials();
}

export { setupEmailCredentials };