require('dotenv').config();

const { sendEmail, generateWelcomeEmailTemplate } = require('./dist/src/utilities/emailService.js');

async function testGmailEmail() {
  try {
    console.log('Testing Gmail email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');

    const emailTemplate = generateWelcomeEmailTemplate({
      userId: 'TEST123',
      name: 'Test User',
      email: 'test@example.com',
      userType: 'user',
    });

    console.log('Sending test email to:', process.env.EMAIL_USER);

    await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email from Bonstay',
      html: `<h1>Test Email</h1><p>This is a test email to verify Gmail SMTP configuration.</p>`,
      text: 'This is a test email to verify Gmail SMTP configuration.',
    });

    console.log('✅ Test email sent successfully! Check your Gmail inbox.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGmailEmail();